package com.jwj.matzip.services;


import com.jwj.matzip.entities.EmailAuthEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.mappers.UserMapper;
import com.jwj.matzip.misc.MailSender;
import com.jwj.matzip.regexes.EmailAuthRegex;
import com.jwj.matzip.regexes.UserRegex;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.results.user.LoginResult;
import com.jwj.matzip.results.user.RegisterResult;
import com.jwj.matzip.results.user.SendRegisterEmailResult;
import com.jwj.matzip.results.user.VerifyEmailAuthResult;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.apache.catalina.User;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.core.token.Sha512DigestUtils;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
public class UserService {
    private static void prepareEmailAuth(EmailAuthEntity emailAuth) throws NoSuchAlgorithmException {
        emailAuth.setCode(RandomStringUtils.randomNumeric(6));
        emailAuth.setSalt(Sha512DigestUtils.shaHex(String.format("%s%s%f%f",
                emailAuth.getEmail(),
                emailAuth.getCode(),
                SecureRandom.getInstanceStrong().nextDouble(),
                SecureRandom.getInstanceStrong().nextDouble())));
        emailAuth.setCreatedAt(LocalDateTime.now());
        emailAuth.setExpiresAt(LocalDateTime.now().plusMinutes(3));
        // 현재 시간에 3분 추가
        emailAuth.setExpired(false);
        emailAuth.setVerified(false);
        emailAuth.setUsed(false);
    }

    private final UserMapper userMapper;
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    public UserService(UserMapper userMapper, JavaMailSender mailSender, SpringTemplateEngine templateEngine) {
        this.userMapper = userMapper;
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }


    public Result sendRegisterEmail(EmailAuthEntity emailAuth) throws NoSuchAlgorithmException, MessagingException {
        if (emailAuth == null || !EmailAuthRegex.email.tests(emailAuth.getEmail())) {
            return CommonResult.FAILURE;
        }

        if (this.userMapper.selectUserByEmail(emailAuth.getEmail()) != null) {
            return SendRegisterEmailResult.FAILURE_DUPLICATE_EMAIL;
        }
        prepareEmailAuth(emailAuth);
        if (this.userMapper.insertEmailAuth(emailAuth) != 1) {
            return CommonResult.FAILURE;
        }

        Context context = new Context();
        context.setVariable("code", emailAuth.getCode());
        new MailSender(this.mailSender)
                .setFrom("jwj19960503@gmail.com")
                .setSubject("[맛집] 회원가입 인증번호")
                .setTo(emailAuth.getEmail())
                .setText(this.templateEngine.process("user/registerEmail", context), true)
                .send();
        return CommonResult.SUCCESS;
    }

    public Result verifyEmailAuth(EmailAuthEntity emailAuth) {
        if (emailAuth == null ||
                !EmailAuthRegex.email.tests(emailAuth.getEmail()) ||
                !EmailAuthRegex.code.tests(emailAuth.getCode()) ||
                !EmailAuthRegex.salt.tests(emailAuth.getSalt())) {
            return CommonResult.FAILURE;
        }
        EmailAuthEntity dbEmailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(emailAuth.getEmail(), emailAuth.getCode(), emailAuth.getSalt());
        if (dbEmailAuth == null) {
            return CommonResult.FAILURE;
        }
        if (dbEmailAuth.isExpired() || dbEmailAuth.getExpiresAt().isBefore(LocalDateTime.now())) {
//                                            만료일시          가  * 전         현재시간보다
            return VerifyEmailAuthResult.FAILURE_EXPIRED;
        }
        dbEmailAuth.setVerified(true);
        return this.userMapper.updateEmailAuth(dbEmailAuth) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }


    @Transactional // 실행이 안된 시점 이후의 로직으로 넘어가지 않고 실패 지점에서 실행을 멈추게 만들어준다.
    public Result register(EmailAuthEntity emailAuth, UserEntity user) {
//    3-1 정규화
        if (emailAuth == null ||
                !EmailAuthRegex.email.tests(emailAuth.getEmail()) ||
                !EmailAuthRegex.code.tests(emailAuth.getCode()) ||
                !EmailAuthRegex.salt.tests(emailAuth.getSalt()) ||
                user == null ||
                !UserRegex.email.tests(user.getEmail()) ||
                !UserRegex.password.tests(user.getPassword()) ||
                !UserRegex.nickname.tests(user.getNickname())) {
            System.out.println("정규화 안맞음");
            return CommonResult.FAILURE;
        }

        EmailAuthEntity dbEmailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(emailAuth.getEmail(), emailAuth.getCode(), emailAuth.getSalt());
        if (dbEmailAuth == null || !dbEmailAuth.isVerified() || dbEmailAuth.isUsed()) {
            //    3-2 이메일 인증 완료 여부 확인 (isVerified 가 true 인지 확인)
            System.out.println("이메일인증 안했음");
            return CommonResult.FAILURE;
        }
        if (this.userMapper.selectUserByEmail(emailAuth.getEmail()) != null) {
//    3-4 닉네임 중복 검사 (selectUserByNickname 만들기)
            System.out.println("이메일 중복");
            return RegisterResult.FAILURE_DUPLICATE_EMAIL;
        }
        if (this.userMapper.selectUserByNickname(user.getNickname()) != null) {
//    3-5 사용자 추가 (insertUser 만들기)
            System.out.println("닉네임 중복");
            return RegisterResult.FAILURE_DUPLICATE_NICKNAME;
        }

//    3-6 이메일 인증 사용됨으로 수정 (isUsed 를 true 로 할당 후 UPDATE, updateEmailAuth 있는거 사용)
//        SHA-512 : 고성능의 이유로 암호를 빠르게 풀어버릴 수 있기떄문 보안상 권장 x
//        BCrypt / PBKDF2 : 암호 해석? 변환이 느리기 때문에 권장 o
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setAdmin(false);
        user.setDeleted(false);
        user.setSuspended(false);
        this.userMapper.insertUser(user);
        dbEmailAuth.setUsed(true);
        this.userMapper.updateEmailAuth(dbEmailAuth);

        return CommonResult.SUCCESS;
    }


    public Result sendResetPasswordEmail(EmailAuthEntity emailAuth) throws NoSuchAlgorithmException, MessagingException {
        if (emailAuth == null || !EmailAuthRegex.email.tests(emailAuth.getEmail())) {
            return CommonResult.FAILURE;
        }
        if (this.userMapper.selectUserByEmail(emailAuth.getEmail()) == null) {
            return CommonResult.FAILURE;
        }
        prepareEmailAuth(emailAuth);
        if (this.userMapper.insertEmailAuth(emailAuth) != 1) {
            return CommonResult.FAILURE;
        }

        Context context = new Context();
        context.setVariable("code", emailAuth.getCode());
        new MailSender(this.mailSender)
                .setFrom("jwj19960503@gmail.com")
                .setSubject("[맛집] 비밀번호 재설정 인증번호")
                .setTo(emailAuth.getEmail())
                .setText(this.templateEngine.process("user/resetPasswordEmail", context), true)
                .send();
        return CommonResult.SUCCESS;
    }


    public String getEmailByNickname(String nickname) {
        if (!UserRegex.nickname.tests(nickname)) {
            return null;
        }
        UserEntity dbUser = this.userMapper.selectUserByNickname(nickname);
        return dbUser == null ? null : dbUser.getEmail();
    }


    @Transactional
    public Result resetPassword(EmailAuthEntity emailAuth,
                                UserEntity user) {
        if (emailAuth == null || user == null ||
                !EmailAuthRegex.email.tests(emailAuth.getEmail()) ||
                !EmailAuthRegex.code.tests(emailAuth.getCode()) ||
                !EmailAuthRegex.salt.tests(emailAuth.getSalt()) ||
                !UserRegex.email.tests(user.getEmail()) ||
                !UserRegex.password.tests(user.getPassword())) {
            System.out.println("정규화 안맞음");
            return CommonResult.FAILURE;
        }

        EmailAuthEntity dbEmailAuth = this.userMapper.selectEmailAuthByEmailCodeSalt(emailAuth.getEmail(), emailAuth.getCode(), emailAuth.getSalt());
        if (dbEmailAuth == null || !dbEmailAuth.isVerified()) {
            return CommonResult.FAILURE;
        }

        user.setAdmin(false);
        user.setDeleted(false);
        user.setSuspended(false);
        dbEmailAuth.setUsed(true);
        UserEntity dbUser = this.userMapper.selectUserByEmail(user.getEmail());
        if (dbUser == null || dbUser.isDeleted()) {
            return CommonResult.FAILURE;
        }
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        return this.userMapper.updateUser(dbUser) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }


    public Result login(UserEntity user) {
        if (user == null ||
                !UserRegex.email.tests(user.getEmail()) ||
                !UserRegex.password.tests(user.getPassword())) {
            System.out.println("정규화 안맞음");
            return CommonResult.FAILURE;
        }
        UserEntity dbUser = this.userMapper.selectUserByEmail(user.getEmail());

        if (dbUser == null ||
                dbUser.isDeleted() ||
                !BCrypt.checkpw(user.getPassword(), dbUser.getPassword())) {
            return CommonResult.FAILURE;
        }

        if (dbUser.isSuspended()) {
            return LoginResult.FAILURE_SUSPENDED;
        }

//        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword())); 밑에 set 한 Password 가 이미 암호화 되어 넘어오기 때문에 안해도 됨

        user.setNickname(dbUser.getNickname());
        user.setPassword(dbUser.getPassword());
        user.setCreatedAt(dbUser.getCreatedAt());
        user.setAdmin(dbUser.isAdmin());
        user.setSuspended(dbUser.isSuspended());
        user.setDeleted(dbUser.isDeleted());
        return CommonResult.SUCCESS;
    }


}
