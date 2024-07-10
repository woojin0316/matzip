package com.jwj.matzip.entities;


import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(of = "index")
public class PlaceEntity {
    private int index;
    private byte[] thumbnail;
    private String thumbnailFileName;
    private String thumbnailContactType;
    private String title;
    private String placeCategoryCode;
    private String contactFirst;
    private String contactSecond;
    private String contactThird;
    private String addressPostal;
    private String addressPrimary;
    private String addressSecondary;
    private double latitude;
    private double longitude;
    private String description;
    private String schedule;
    private String userEmail;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

}

