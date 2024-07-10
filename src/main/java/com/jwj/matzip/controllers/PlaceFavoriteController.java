package com.jwj.matzip.controllers;

import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.services.PlaceFavoriteService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/placeFavorite")
public class PlaceFavoriteController {
    private final PlaceFavoriteService placeFavoriteService;

    @Autowired
    public PlaceFavoriteController(PlaceFavoriteService placeFavoriteService) {
        this.placeFavoriteService = placeFavoriteService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute("user") UserEntity user,
                            @RequestParam("placeIndex") int placeIndex) {
        Result result = this.placeFavoriteService.toggle(placeIndex, user.getEmail());
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        if (result == CommonResult.SUCCESS) {
            responseObject.put("saved", this.placeFavoriteService.get(placeIndex, user.getEmail()) != null);
        }
        return responseObject.toString();
    }
}
