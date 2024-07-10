package com.jwj.matzip.mappers;

import com.jwj.matzip.dtos.PlaceDto;
import com.jwj.matzip.entities.PlaceEntity;
import com.jwj.matzip.entities.UserEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaceMapper {
    int deletePlaceByIndex(@Param("index") int index);

    int insertPlace(PlaceEntity place);

    PlaceEntity selectPlaceByIndex(@Param("index") int index);

    PlaceDto selectPlaceDtoByIndexAndUserEmail(@Param("index") int index,
                                               @Param("userEmail") String userEmail);

    PlaceDto[] selectPlaceByCoords(@Param("minLat") double minLat,
                                   @Param("minLng") double minLng,
                                   @Param("maxLat") double maxLat,
                                   @Param("maxLng") double maxLng); // 순서 중요 >> service 매개변수 순서와 일치시켜야한다.


    PlaceDto selectPlaceDtoByIndex(@Param("index") int index);

    PlaceEntity selectPlaceByContact(@Param("contactFirst") String contactFirst,
                                     @Param("contactSecond") String contactSecond,
                                     @Param("contactThird") String contactThird);


}
