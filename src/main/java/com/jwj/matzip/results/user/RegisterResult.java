package com.jwj.matzip.results.user;

import com.jwj.matzip.results.Result;

public enum RegisterResult implements Result {
    FAILURE_DUPLICATE_EMAIL,
    FAILURE_DUPLICATE_NICKNAME
}
