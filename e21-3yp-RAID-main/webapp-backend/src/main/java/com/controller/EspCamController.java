package com.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import com.model.EspCamDetection;
import com.repositary.EspCamRepository;

@RestController
@RequestMapping("/api/detections")
@CrossOrigin(origins = "http://localhost:3000") // Allows React to talk to Java
public class EspCamController {

    @Autowired
    private EspCamRepository repository;

    @GetMapping
    public List<EspCamDetection> getAllDetections() {
        // This pulls the latest data (including your imageUrl!) from DynamoDB
        return repository.findAll(); 
    }
}
