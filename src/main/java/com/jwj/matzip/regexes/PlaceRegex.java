package com.jwj.matzip.regexes;


import lombok.experimental.UtilityClass;

@UtilityClass
public class PlaceRegex {
    public static final Regex title = new Regex("^([\\da-zA-Z가-힣()\\-. ]{1,50})$");
    //                                                                           ^ 띄우기
    public static final Regex contactFirst = new Regex("^(\\d{3,4})$");
    public static final Regex contactSecond = new Regex("^(\\d{3,4})$");
    public static final Regex contactThird = new Regex("^(\\d{4})$");
    public static final Regex addressPostal = new Regex("^(\\d{5})$");
    public static final Regex addressPrimary = new Regex("^([\\da-zA-Z가-힣()\\- ]{5,100})$");
    //                                                                                   ^ 띄우기
    public static final Regex addressSecondary = new Regex("^([\\da-zA-Z가-힣()\\-\\[\\]'\",. ]{0,100})$");
    //                                                                                                ^ 띄우기
    public static final Regex description = new Regex("^([\\s\\S]{0,10000})$");
    //                                                           ^{0,10000}$ 는 엔터를 허용 안하니까 수정하기

}
