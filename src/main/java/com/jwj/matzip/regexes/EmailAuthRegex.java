package com.jwj.matzip.regexes;




public class EmailAuthRegex {
    public static final Regex email = new Regex(UserRegex.email.expression);
    public static final Regex code = new Regex("^(\\d{6})$");
    public static final Regex salt = new Regex("^([\\da-f]{128})");
}









