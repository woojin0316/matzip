package com.jwj.matzip.controllers;

import com.jwj.matzip.dtos.PlaceDto;
import com.jwj.matzip.entities.PlaceEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.services.PlaceService;
import org.json.JSONObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@Controller
@RequestMapping("/place")
public class PlaceController {

    private final PlaceService placeService;

    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @RequestMapping(value="/", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String deleteIndex(@SessionAttribute("user") UserEntity user, @RequestParam("index") int index){
        Result result = this.placeService.delete(user, index);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }

    @RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public PlaceDto getIndex(
            @SessionAttribute(value = "user", required = false) UserEntity user,
            @RequestParam("index") int index){
        return this.placeService.get(index, user);
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute("user") UserEntity user,
                            @RequestParam("_thumbnail") MultipartFile thumbnail,
                            PlaceEntity place) throws IOException {
        System.out.println("파일 이름 : " + thumbnail.getOriginalFilename());
        System.out.println("파일 크기 : " + thumbnail.getSize());
        System.out.println("파일 타입 : " + thumbnail.getContentType());

        place.setThumbnail((thumbnail.getBytes()));
        place.setThumbnailFileName(thumbnail.getOriginalFilename());
        place.setThumbnailContactType(thumbnail.getContentType());

        Result result = this.placeService.add(user, place);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());

        return responseObject.toString();
    }

    @RequestMapping(value = "/byCoords", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public PlaceDto[] getByCoords(@RequestParam("minLat") double minLat,
                                  @RequestParam("minLng") double minLng,
                                  @RequestParam("maxLat") double maxLat,
                                  @RequestParam("maxLng") double maxLng) {
        PlaceDto[] places = this.placeService.getByCoords(minLat, minLng, maxLat, maxLng);
        return places;
    }

    @RequestMapping(value = "/thumbnail", method = RequestMethod.GET)
    public ResponseEntity<byte[]> getThumbnail(@RequestParam("index") int index) {
        PlaceEntity place = this.placeService.get(index);
        if (place == null) {
            return ResponseEntity.notFound().build(); // Not Found (404)
        }
        return ResponseEntity.ok() // OK (200)
                .contentType(MediaType.parseMediaType(place.getThumbnailContactType()))
                .contentLength(place.getThumbnail().length)
                .body(place.getThumbnail());
    }
}
