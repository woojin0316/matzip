package com.jwj.matzip.mappers;

import com.jwj.matzip.entities.PlaceReportEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.security.core.parameters.P;

@Mapper
public interface PlaceReportMapper {
    int insertPlaceReport(PlaceReportEntity placeReport);

    PlaceReportEntity selectPlaceReport(@Param("placeIndex") int placeIndex,
                                        @Param("userEmail") String userEmail);
}
