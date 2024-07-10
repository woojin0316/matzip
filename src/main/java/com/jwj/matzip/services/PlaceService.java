package com.jwj.matzip.services;


import com.jwj.matzip.dtos.PlaceDto;
import com.jwj.matzip.entities.PlaceEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.mappers.PlaceFavoriteMapper;
import com.jwj.matzip.mappers.PlaceMapper;
import com.jwj.matzip.regexes.PlaceRegex;
import com.jwj.matzip.regexes.UserRegex;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.results.place.AddResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PlaceService {

    private final PlaceMapper placeMapper;
    private final PlaceFavoriteMapper placeFavoriteMapper;

    @Autowired
    public PlaceService(PlaceMapper placeMapper, PlaceFavoriteMapper placeFavoriteMapper) {
        this.placeMapper = placeMapper;
        this.placeFavoriteMapper = placeFavoriteMapper;
    }

    public Result delete(UserEntity user, int index) {
        if (user == null || !UserRegex.email.tests(user.getEmail())) {
            return CommonResult.FAILURE;
        }
        PlaceEntity place = this.placeMapper.selectPlaceByIndex(index);
        if (place == null || !place.getUserEmail().equals(user.getEmail())) {
            return CommonResult.FAILURE;
        }
        return this.placeMapper.deletePlaceByIndex(index) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    // 맛집 삭제
    public Result deletePlace(int placeIndex, UserEntity user) {
        PlaceEntity dbPlace = this.placeMapper.selectPlaceByIndex(placeIndex);
        System.out.println(dbPlace.getUserEmail());
        // 전달 받은 인덱스와 일치하는 맛집이 없으면 FAILURE
        if (dbPlace == null) {
            System.out.println("ㅇㅇ");
            return CommonResult.FAILURE;
        }
        // 있다면, 그 맛집 작성자와 로그인한 사용자(user)가 다르면 FAILURE
        if (!user.getEmail().equals(dbPlace.getUserEmail())) {
            System.out.println(user.getEmail() + dbPlace.getUserEmail());
            return CommonResult.FAILURE;
        }
        // 삭제 했다면 SUCCESS, 못했다면 FAILURE
        return this.placeMapper.deletePlaceByIndex(placeIndex) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    // 맛집 등록 버튼을 눌렀을 때의 서비스 메서드
    public Result add(UserEntity user, PlaceEntity place) {
        if (user == null) {
            return AddResult.FAILURE_NOT_LOGIN;
        }

        if (place == null ||
                !PlaceRegex.title.tests(place.getTitle()) ||
                !PlaceRegex.contactFirst.tests(place.getContactFirst()) ||
                !PlaceRegex.contactSecond.tests(place.getContactSecond()) ||
                !PlaceRegex.contactThird.tests(place.getContactThird()) ||
                !PlaceRegex.addressPostal.tests(place.getAddressPostal()) ||
                !PlaceRegex.addressPrimary.tests(place.getAddressPrimary()) ||
                !PlaceRegex.addressSecondary.tests(place.getAddressSecondary()) ||
                !PlaceRegex.description.tests(place.getDescription())) {
            return CommonResult.FAILURE;
        }
        if (!PlaceRegex.addressSecondary.tests(place.getAddressSecondary())) {
            return AddResult.FAILURE_DUPLICATE_SECONDARY;
        }

        if (!PlaceRegex.description.tests(place.getDescription())) {
            return AddResult.FAILURE_DUPLICATE_DESCRIPTION;
        }


        place.setUserEmail(user.getEmail());
        place.setCreatedAt(LocalDateTime.now());
        place.setModifiedAt(null); // 기존 수정 값 null 로 초기화
        if (this.placeMapper.selectPlaceByContact(
                place.getContactFirst(),
                place.getContactSecond(),
                place.getContactThird()) != null) {
            return AddResult.FAILURE_DUPLICATE_CONTACT;
        }
        return this.placeMapper.insertPlace(place) > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }

    // 썸네일 파일 저장 시[getThumbnail()] db의 place 들 중 index와 동일한 place를 뽑아오는 메서드.
    public PlaceEntity get(int index) {
        return this.placeMapper.selectPlaceByIndex(index);
    }

    // db의 place 중 만족하는 최소 최대 위경도 값안에 포함되는 각 place를 PlaceEntity[] 배열로 반환하는 메서드.
    public PlaceDto[] getByCoords(double minLat, double minLng, double maxLat, double maxLng) {
        return this.placeMapper.selectPlaceByCoords(minLat, minLng, maxLat, maxLng); // 매개변수의 순서 상당히 중요
    }

    public PlaceDto getPlaceDto(int index) {
        PlaceDto placeDtos = this.placeMapper.selectPlaceDtoByIndex(index);
        return placeDtos;
    }


    public PlaceDto get(int index, UserEntity user) {
        PlaceDto place = this.placeMapper.selectPlaceDtoByIndexAndUserEmail(index, user == null ? null : user.getEmail());
        place.setSigned(user != null);
        place.setMine(user != null && user.getEmail().equals(place.getUserEmail()));
        place.setSaved(user != null && this.placeFavoriteMapper.selectPlaceFavorite(place.getIndex(), user.getEmail()) != null);
        return place;
    }

}
