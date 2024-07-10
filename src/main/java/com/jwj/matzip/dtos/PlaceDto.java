package com.jwj.matzip.dtos;

import com.jwj.matzip.entities.PlaceEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
//LocalTime 현재 시간
//LocalDateTime 현재 날짜와 시간

@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class PlaceDto extends PlaceEntity {
    public static final String[] days = {"mon", "tue", "wed", "thu", "fri", "sat", "sun"};
    // 일주일의 요일은 절대 바뀌지 않는 것 이기 때문에 static final 을 써서 절대 바뀌지 않도록 만들어준다.

    private String day = days[LocalDateTime.now().getDayOfWeek().getValue() - 1];// LocalDateTime.언제.주중 주말 월중 연중 등등. 몇번째날? -1(인덱스는 0부터 시작)
    private String time = LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"));
    // xml 을 거쳐서 객체화가 될때 자동으로 삽입해준다.
    private String placeCategoryText;
    private String userNickname; //작성자 닉네임
    private String favoriteCount; // 즐겨찾기 갯수
    private String reviewCount; // 리뷰 갯수
    private boolean isSigned;    // 로그인 여부
    private boolean isMine;      // 해당 맛집 작성자 == 로그인한 사람 (로그인 안 했으면 false)
    private boolean isSaved;     // 즐겨찾기 여부
}
