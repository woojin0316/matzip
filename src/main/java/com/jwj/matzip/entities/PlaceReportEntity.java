package com.jwj.matzip.entities;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@EqualsAndHashCode(of = {"placeIndex", "userEmail"})
@AllArgsConstructor
@NoArgsConstructor
public class PlaceReportEntity {
    private int placeIndex;
    private String userEmail;
    private LocalDateTime createdAt;
}
