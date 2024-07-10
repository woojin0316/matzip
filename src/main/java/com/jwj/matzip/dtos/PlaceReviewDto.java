package com.jwj.matzip.dtos;


import com.jwj.matzip.entities.PlaceReviewEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlaceReviewDto extends PlaceReviewEntity {
    private String userNickname;
    private int[] imageIndexes; // 이미지들의 배열을 가져오기 위함
    private boolean isSigned; //로그인 여부
    private boolean isMine; // 작성자본인 확인 (삭제, 신고를 위함)

}
