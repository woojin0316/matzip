package com.jwj.matzip.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Data
@EqualsAndHashCode(of = "email")
public class UserEntity {
    private String email;
    private String password;
    private String nickname;
    private LocalDateTime createdAt;
    private boolean isAdmin;
    private boolean isDeleted;
    private boolean isSuspended;
}
