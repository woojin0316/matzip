package com.jwj.matzip.mappers;

import com.jwj.matzip.entities.PlaceFavoriteEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PlaceFavoriteMapper {
    int deletePlaceFavorite(@Param("placeIndex") int placeIndex,
                            @Param("userEmail") String userEmail);

    int insertPlaceFavorite(PlaceFavoriteEntity placeFavorite);

    PlaceFavoriteEntity selectPlaceFavorite(@Param("placeIndex") int placeIndex,
                                            @Param("userEmail") String userEmail);
}