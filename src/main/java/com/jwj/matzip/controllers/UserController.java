package com.jwj.matzip.controllers;


import com.jwj.matzip.entities.EmailAuthEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.services.UserService;
import jakarta.mail.MessagingException;
import jakarta.servlet.http.HttpSession;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.NoSuchAlgorithmException;

import static com.jwj.matzip.regexes.UserRegex.email;


//200	에러없이 성공적으로 페이지를 불러오거나 데이터를 전송
//400	Bad Request 로써, 요청 실패-문법상 오류가 있어서 서버가 요청 사항을 이해하지 못함
//404	Not Found, 문서를 찾을 수 없음->클라이언트가 요청한 문서를 찾지 못한 경우에 발생함 (URL을 잘 살펴보기)
//405	Method not allowed, 메소드 허용 안됨-> Request 라인에 명시된 메소드를 수행하기 위한 해당 자원의 이용이 허용되지 않았을 경우 발생함.    (페이지는 존재하나, 그걸 못보게 막거나 리소스를 허용안함)
//        415
//지원되지 않는 형식으로 클라이언트가 요청을 해서 서버가 요청에 대한 승인을 거부한 오류를 의미한다.
//
//        (ContentType,Content Encoding 데이터를 확인할 필요가 있다.)
//
//        500	서버 내부 오류는 웹 서버가 요청사항을 수행할 수 없을 경우에 발생함
//505	HTTP Version Not Supported


@Controller
@RequestMapping("/user")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @RequestMapping(value = "/login", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postLogin (HttpSession session,
                             UserEntity user){
        Result result = this.userService.login(user);
        if (result == CommonResult.SUCCESS) {
            session.setAttribute("user", user); // 브라우저에서 새로고침을 해도 유저 정보 값이 유지될 수 있도록 해줌.
        }

        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }


    @RequestMapping(value="/logout", method = RequestMethod.GET, produces = MediaType.TEXT_HTML_VALUE)
    public String getLogout(HttpSession session){
        session.setAttribute("user", null);
        return "redirect:/";
    }


    @RequestMapping(value = "/resetPassword", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchResetPassword(EmailAuthEntity emailAuth,
                                          UserEntity user) {
        Result result = this.userService.resetPassword(emailAuth, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "/resetPasswordEmail", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchVarifyResetPasswordEmail(EmailAuthEntity emailAuth) {
        Result result = this.userService.verifyEmailAuth(emailAuth);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }


    @RequestMapping(value = "/resetPasswordEmail", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    String postResetPasswordEmail(EmailAuthEntity emailAuth) throws MessagingException, NoSuchAlgorithmException {
        Result result = this.userService.sendResetPasswordEmail(emailAuth);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("salt", emailAuth.getSalt());
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "/email", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    String getEmail(@RequestParam("nickname") String nickname) {
        String email = this.userService.getEmailByNickname(nickname);
        Result result = email == null ? CommonResult.FAILURE : CommonResult.SUCCESS;
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("email", email);
        }
        return responseObject.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(EmailAuthEntity emailAuth, UserEntity user) {
        Result result = this.userService.register(emailAuth, user);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "/registerEmail", method = RequestMethod.PATCH, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String patchRegisterEmail(EmailAuthEntity emailAuth) {
        Result result = this.userService.verifyEmailAuth(emailAuth);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }


    @RequestMapping(value = "/registerEmail", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postRegisterEmail(EmailAuthEntity emailAuth) throws NoSuchAlgorithmException, MessagingException {
        Result result = this.userService.sendRegisterEmail(emailAuth);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("salt", emailAuth.getSalt());
        }
        return responseObject.toString();
    }
}
