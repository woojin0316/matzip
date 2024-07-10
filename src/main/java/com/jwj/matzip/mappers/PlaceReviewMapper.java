package com.jwj.matzip.mappers;


import com.jwj.matzip.dtos.PlaceReviewDto;
import com.jwj.matzip.entities.PlaceReviewEntity;
import com.jwj.matzip.entities.PlaceReviewImageEntity;
import com.jwj.matzip.entities.PlaceReviewReportEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.security.core.parameters.P;

@Mapper
public interface PlaceReviewMapper {
    int deletePlaceReview (@Param("index") int index);

    int insertPlaceReview(PlaceReviewEntity placeReview);

    int insertPlaceReviewImage(PlaceReviewImageEntity placeReviewImage);

    int insertPlaceReviewReport(PlaceReviewReportEntity placeReviewReport);

    PlaceReviewDto[] selectPlaceReviewByPlaceIndex(@Param("placeIndex") int placeIndex);

    PlaceReviewImageEntity[] selectPlaceReviewImageByPlaceReviewIndex(@Param("placeReviewIndex") int placeReviewIndex,
                                                                      @Param("excludeData") boolean excludeData); // data 열 제외 여부

    PlaceReviewImageEntity selectPlaceReviewImage(@Param("index") int index);

    PlaceReviewEntity selectPlaceReview(@Param("index") int index);

    PlaceReviewReportEntity selectPlaceReviewReport(@Param("placeReviewIndex") int placeReviewIndex,
                                                    @Param("userEmail") String userEmail);

}
