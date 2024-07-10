package com.jwj.matzip.regexes;



public class Regex {

    public final String expression;

    public Regex(String expression) {
        this.expression = expression;
    }

    public boolean tests(String input) {
        return this.tests(input, false);
    }


    public boolean tests(String input, boolean allowNullOrEmpty){
        if (input == null || input.isEmpty()){
            return allowNullOrEmpty;
        }
        return input.matches(this.expression);
    }
}