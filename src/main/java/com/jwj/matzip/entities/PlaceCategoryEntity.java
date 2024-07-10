package com.jwj.matzip.entities;


import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(of = "code")
public class PlaceCategoryEntity {

    private String code;
    private String text;
}
