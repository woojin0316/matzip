package com.jwj.matzip.entities;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Builder
@Data
@EqualsAndHashCode(of = "index")
@AllArgsConstructor
public class PlaceReviewImageEntity {
    @Builder.Default
    private int index = 0;
    @Builder.Default
    private int placeReviewIndex = 0;
    private byte[] data;
    private String name;
    private String contentType;

    public PlaceReviewImageEntity() {
        this.index = 0;
        this.placeReviewIndex = 0;
    }
}
