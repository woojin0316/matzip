package com.jwj.matzip.controllers;


import com.jwj.matzip.entities.PlaceReportEntity;
import com.jwj.matzip.entities.UserEntity;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.services.PlaceReportService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.SessionAttribute;

@Controller
@RequestMapping("/placeReport")
public class PlaceReportController {

    private final PlaceReportService placeReportService;

    @Autowired
    public PlaceReportController(PlaceReportService placeReportService) {
        this.placeReportService = placeReportService;
    }

    @RequestMapping(value = "/", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
    @ResponseBody
    public String postIndex(@SessionAttribute("user") UserEntity user,
                            PlaceReportEntity placeReport) {
        placeReport.setUserEmail(user.getEmail());
        Result result = this.placeReportService.add(placeReport);
        JSONObject responseObject = new JSONObject();
        responseObject.put("result", result.name().toLowerCase());
        return responseObject.toString();
    }
}