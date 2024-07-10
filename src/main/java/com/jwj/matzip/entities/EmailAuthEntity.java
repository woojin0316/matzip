package com.jwj.matzip.entities;

import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;


@Data
@EqualsAndHashCode(of= {"email", "code", "salt"})
public class EmailAuthEntity {
    private String email;
    private String code;
    private String salt;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean isExpired;
    private boolean isVerified;
    private boolean isUsed;



}
