package com.jwj.matzip.controllers;


import com.jwj.matzip.dtos.PlaceReviewDto;
import com.jwj.matzip.entities.PlaceReviewEntity;
import com.jwj.matzip.entities.PlaceReviewImageEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.services.PlaceReviewService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Controller
@RequestMapping(value = "/placeReview")
public class PlaceReviewController {

    private final PlaceReviewService placeReviewService;

    @Autowired
    public PlaceReviewController(PlaceReviewService placeReviewService) {
        this.placeReviewService = placeReviewService;
    }

    @RequestMapping(value = "/report", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postReport(@SessionAttribute(value = "user", required = false) UserEntity user,
                             @RequestParam(value = "index", required = false, defaultValue = "0") int index) {
        Result result = this.placeReviewService.report(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute(value = "user", required = false) UserEntity user,
                              @RequestParam(value = "index", required = false, defaultValue = "0") int index) {
        Result result = this.placeReviewService.delete(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "/image", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity<byte[]> getImage(@RequestParam(value = "index", required = false, defaultValue = "0") int index) {
        PlaceReviewImageEntity image = this.placeReviewService.getImage(index);
        if (image == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentLength(image.getData().length)
                .contentType(MediaType.parseMediaType(image.getContentType()))
                .body(image.getData());


    }

    @RequestMapping(value = "/reviews", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public PlaceReviewDto[] getReviews(@SessionAttribute(value = "user", required = false) UserEntity user,
                                       @RequestParam(value = "placeIndex", required = false, defaultValue = "0") int placeIndex) {
        return this.placeReviewService.get(user, placeIndex);
    }


    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute("user") UserEntity user,
                            @RequestParam(value = "_images", required = false) MultipartFile[] images,
                            PlaceReviewEntity placeReview) throws IOException {
        placeReview.setUserEmail(user.getEmail());
        if (images == null) {
            images = new MultipartFile[0];
        }
        PlaceReviewImageEntity[] placeReviewImages = new PlaceReviewImageEntity[images.length];
        for (int i = 0; i < images.length; i++) {
            PlaceReviewImageEntity placeReviewImage = new PlaceReviewImageEntity();
            placeReviewImage.setData(images[i].getBytes());
            placeReviewImage.setName(images[i].getOriginalFilename());
            placeReviewImage.setContentType(images[i].getContentType());
            placeReviewImages[i] = placeReviewImage;
        }
        Result result = this.placeReviewService.add(placeReview, placeReviewImages);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }
}
