package com.jwj.matzip.services;


import com.jwj.matzip.entities.PlaceReportEntity;
import com.jwj.matzip.mappers.PlaceReportMapper;
import com.jwj.matzip.results.CommonResult;
import com.jwj.matzip.results.Result;
import com.jwj.matzip.results.placeReport.AddResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PlaceReportService {

    private final PlaceReportMapper placeReportMapper;

    @Autowired
    public PlaceReportService(PlaceReportMapper placeReportMapper) {
        this.placeReportMapper = placeReportMapper;
    }

    public Result add(PlaceReportEntity placeReport){
        PlaceReportEntity dbReport = this.placeReportMapper.selectPlaceReport(placeReport.getPlaceIndex(), placeReport.getUserEmail());
        //이미 신고했을 경우 AddResult.FAILURE_DUPLICATE
        if(dbReport != null){
            return AddResult.FAILURE_DUPLICATE;
        }
        placeReport.setCreatedAt(LocalDateTime.now());
        // INSERT 실패 시 CommonResult.FAILURE
        // INSERT 성공 시 CommonResult.SUCCESS
        return this.placeReportMapper.insertPlaceReport(placeReport) > 0  ? CommonResult.SUCCESS : CommonResult.FAILURE;
    }
}
