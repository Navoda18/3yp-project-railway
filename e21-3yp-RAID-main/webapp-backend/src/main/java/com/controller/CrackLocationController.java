package com.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.dto.sensor.IRSensorDataDTO;
import com.service.CrackLocationQueryService;

@RestController
@RequestMapping("/api/crack-locations")
public class CrackLocationController {

    private final CrackLocationQueryService crackLocationQueryService;

    public CrackLocationController(CrackLocationQueryService crackLocationQueryService) {
        this.crackLocationQueryService = crackLocationQueryService;
    }

    @GetMapping
    public List<IRSensorDataDTO> getCrackLocations() {
        return crackLocationQueryService.findAllCrackLocations();
    }

    @GetMapping("/recent")
    public List<IRSensorDataDTO> getRecentCrackLocations(@RequestParam(defaultValue = "24") int hours) {
        return crackLocationQueryService.findRecentCrackLocations(hours);
    }
}
