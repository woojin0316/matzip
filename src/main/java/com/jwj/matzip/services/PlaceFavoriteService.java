package com.jwj.matzip.services;

import com.jwj.matzip.entities.PlaceFavoriteEntity;
import com.jwj.matzip.mappers.PlaceFavoriteMapper;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PlaceFavoriteService {
    private final PlaceFavoriteMapper placeFavoriteMapper;

    @Autowired
    public PlaceFavoriteService(PlaceFavoriteMapper placeFavoriteMapper) {
        this.placeFavoriteMapper = placeFavoriteMapper;
    }

    public PlaceFavoriteEntity get(int placeIndex, String userEmail) {
        return this.placeFavoriteMapper.selectPlaceFavorite(placeIndex, userEmail);
    }

    public Result toggle(int placeIndex, String userEmail) {
        int affectedRows;
        if (this.placeFavoriteMapper.selectPlaceFavorite(placeIndex, userEmail) == null) {
            PlaceFavoriteEntity placeFavorite = new PlaceFavoriteEntity();
            placeFavorite.setPlaceIndex(placeIndex);
            placeFavorite.setUserEmail(userEmail);
            placeFavorite.setCreatedAt(LocalDateTime.now());
            affectedRows = this.placeFavoriteMapper.insertPlaceFavorite(placeFavorite);
        } else {
            affectedRows = this.placeFavoriteMapper.deletePlaceFavorite(placeIndex, userEmail);
        }
        return affectedRows > 0 ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}