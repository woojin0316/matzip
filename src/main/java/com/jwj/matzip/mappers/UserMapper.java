package com.jwj.matzip.mappers;


import com.jwj.matzip.entities.EmailAuthEntity;
import com.jwj.matzip.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface UserMapper {
    int insertEmailAuth(EmailAuthEntity emailAuth);


    int insertUser(UserEntity user);

    EmailAuthEntity selectEmailAuthByEmailCodeSalt(@Param("email") String email,
                                                   @Param("code") String code,
                                                   @Param("salt") String salt);

    UserEntity selectUserByEmail(@Param("email") String email);

    UserEntity selectUserByNickname(@Param("nickname") String nickname);

    int updateEmailAuth(EmailAuthEntity emailAuth);

    int updateUser (UserEntity user);
}
