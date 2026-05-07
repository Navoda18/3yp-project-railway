#include <Arduino.h>
#include <TinyGPS++.h>
#include "gps_sensor.h"

namespace
{
    TinyGPSPlus gps;
    HardwareSerial gpsSerial(1);

    constexpr int GPS_RX_PIN = 17;
    constexpr int GPS_TX_PIN = 16;
    constexpr unsigned long GPS_BAUD_RATE = 9600;
} // namespace

void initGPSSensor()
{
    gpsSerial.begin(GPS_BAUD_RATE, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN);
}

void updateGPSStream()
{
    while (gpsSerial.available() > 0)
    {
        gps.encode(gpsSerial.read());
    }
}

GPSData readGPSData()
{
    GPSData data{};
    data.valid = isValid();
    data.latitude = getLat();
    data.longitude = getLng();
    data.satellites = gps.satellites.isValid() ? static_cast<int>(gps.satellites.value()) : 0;
    return data;
}

bool isValid()
{
    return gps.location.isValid();
}

double getLat()
{
    return isValid() ? gps.location.lat() : 7.2699 ;
}

double getLng()
{
    return isValid() ? gps.location.lng() :  80.5938;
}
