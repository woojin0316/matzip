package com.jwj.matzip.entities;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Builder
@Data
@EqualsAndHashCode(of = "index")
@AllArgsConstructor
public class PlaceReviewEntity {
    @Builder.Default
    private int index = 0;
    @Builder.Default
    private int placeIndex = 0;
    private String userEmail;
    @Builder.Default
    private int rating = 0;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime modifiedAt;

    public PlaceReviewEntity(){
        this.index = 0;
        this.placeIndex = 0;
        this.rating = 0;
    }
}
