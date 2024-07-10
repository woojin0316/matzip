package com.jwj.matzip.services;


import com.jwj.matzip.dtos.PlaceReviewDto;
import com.jwj.matzip.entities.PlaceReviewEntity;
import com.jwj.matzip.entities.PlaceReviewImageEntity;
import com.jwj.matzip.entities.PlaceReviewReportEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.mappers.PlaceReviewMapper;
import com.jwj.matzip.regexes.PlaceReviewRegex;
import com.jwj.matzip.regexes.UserRegex;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.results.placeReview.ReportResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class PlaceReviewService {

    private final PlaceReviewMapper placeReviewMapper;

    @Autowired
    public PlaceReviewService(PlaceReviewMapper placeReviewMapper) {
        this.placeReviewMapper = placeReviewMapper;
    }

    public  Result report(UserEntity user, int index){
        if (user == null || index < 1){
            return CommonResult.FAILURE;
        }
        if(this.placeReviewMapper.selectPlaceReviewReport(index, user.getEmail()) != null){
            return ReportResult.FAILURE_DUPLICATE;
        }
        PlaceReviewReportEntity placeReviewReport = new PlaceReviewReportEntity();
        placeReviewReport.setPlaceReviewIndex(index);
        placeReviewReport.setUserEmail(user.getEmail());
        placeReviewReport.setCreatedAt(LocalDateTime.now());
        return this.placeReviewMapper.insertPlaceReviewReport(placeReviewReport) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }


    public Result delete(UserEntity user, int index){
        if(user == null || index < 1){
            System.out.println(index);
            return CommonResult.FAILURE;
        }
        PlaceReviewEntity dbPlaceReview = this.placeReviewMapper.selectPlaceReview(index);
        if (dbPlaceReview == null || !dbPlaceReview.getUserEmail().equals(user.getEmail())){
        System.out.println(dbPlaceReview.getUserEmail());
        System.out.println(user.getEmail());
            return CommonResult.FAILURE;
        }
        return this.placeReviewMapper.deletePlaceReview(index) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    public PlaceReviewImageEntity getImage(int index){
        if (index <1){
            return null;
        }
        return this.placeReviewMapper.selectPlaceReviewImage(index);
    }

    public PlaceReviewDto[] get(UserEntity user, int placeIndex){
        if(placeIndex <1){
            return new PlaceReviewDto[0];
        }
        PlaceReviewDto[] placeReviews =this.placeReviewMapper.selectPlaceReviewByPlaceIndex(placeIndex);
        for (PlaceReviewDto placeReview : placeReviews){
           PlaceReviewImageEntity[] placeReviewImages = this.placeReviewMapper.selectPlaceReviewImageByPlaceReviewIndex(placeReview.getIndex(), true);
           int[] imageIndexes = new int[placeReviewImages.length];
           for (int i = 0; i <placeReviewImages.length; i++){
               imageIndexes[i] = placeReviewImages[i].getIndex();
           }
           placeReview.setImageIndexes(imageIndexes);
           placeReview.setSigned(user != null);
            placeReview.setMine(user != null && user.getEmail().equals(placeReview.getUserEmail()));
        }
        return placeReviews;
    }


    @Transactional
    public Result add(PlaceReviewEntity placeReview, PlaceReviewImageEntity[] placeReviewImages) {
        if (!UserRegex.email.tests(placeReview.getUserEmail()) ||
                !PlaceReviewRegex.content.tests(placeReview.getContent())) {
            return CommonResult.FAILURE;
        }
        placeReview.setCreatedAt(LocalDateTime.now());
        placeReview.setModifiedAt(null);
        if(this.placeReviewMapper.insertPlaceReview(placeReview) == 0){
            return CommonResult.FAILURE;
        }
        for(PlaceReviewImageEntity placeReviewImage : placeReviewImages){
            placeReviewImage.setPlaceReviewIndex(placeReview.getIndex());
            if(this.placeReviewMapper.insertPlaceReviewImage(placeReviewImage) == 0){
                throw new RuntimeException();
            }
        }
        return CommonResult.SUCCESS;
    }
}
