package com.jwj.matzip.entities;


import lombok.*;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@EqualsAndHashCode(of = {"placeIndex", "userEmail"})
public class PlaceFavoriteEntity {

    @Builder.Default
    private int placeIndex = 0;
    private String userEmail;
    private LocalDateTime createdAt;

    public PlaceFavoriteEntity() {
        this.placeIndex = 0;
    }
}

//@Builder 는 기본적으로 모든 멤버 변수에 null 을 할당하려는 속성이 있음. 그런데 기초 타입의 멤버 변수는 null 을 받을 수 없어서 빌드 단계에서 오류가 발생함.
//    - 그래서, @Builder.Default 를 활용하여 기본 값을 할당하고, 매개 변수가 없는 생성자를 사용하여서 기본 값을 할당하여야 함.
//    - 그런데, 저런 매개 변수가 없는 생성자를 만들어 버리면 모든 매개 변수를 가지는 생성자가 만들어지지 않음. 문제는, @Data 어노테이션은 모든 매개 변수를 가지는 생성자를 가져야한다는거임. 그래서 @AllArgsConstructor 를 수동으로 붙여주는거임.
// - @ Data 어노테이션은 왜 쓰나요? @Getter @Setter 대신
//
//- 그래서, 위 과정이 너무 복잡하다 싶으면 아싸리 @Builder 쓰지 말고 아래로 대체하는 것도 좋은 생각임.
//@Data
//@EqualsAndHashCode(of = ...)

