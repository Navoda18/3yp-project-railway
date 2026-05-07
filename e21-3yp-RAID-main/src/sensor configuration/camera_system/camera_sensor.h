#ifndef CAMERA_SENSOR_H
#define CAMERA_SENSOR_H

#include "esp_camera.h"
#include <Arduino.h>

// Struct to hold information about the captured image
struct CameraStatus {
    bool initialized;
    bool lastCaptureSuccess;
    size_t lastImageSize;
};

// Initializes the camera hardware pins and settings
bool initCameraSensor();

// Captures a frame and returns the pointer to the image buffer
camera_fb_t* takePhoto();

// Releases the image buffer memory (IMPORTANT to prevent crashes)
void returnPhoto(camera_fb_t* fb);

// Gets the current status of the camera
CameraStatus getCameraStatus();

#endif