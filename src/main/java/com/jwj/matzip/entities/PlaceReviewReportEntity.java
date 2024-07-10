package com.jwj.matzip.entities;


import lombok.*;

import java.time.LocalDateTime;


@Getter
@Setter
@EqualsAndHashCode(of = {"placeReviewIndex", "userEmail"})
@AllArgsConstructor
@NoArgsConstructor
public class PlaceReviewReportEntity {
    private int placeReviewIndex;
    private String userEmail;
    private LocalDateTime createdAt;
}
