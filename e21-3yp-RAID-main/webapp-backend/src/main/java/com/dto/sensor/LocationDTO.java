package com.dto.sensor;

public class LocationDTO {

    private double lat;
    private double lng;
    private boolean valid;
    private int satellites;

    public LocationDTO() {
    }

    public LocationDTO(double lat, double lng) {
        this.lat = lat;
        this.lng = lng;
    }

    public LocationDTO(double lat, double lng, boolean valid, int satellites) {
        this.lat = lat;
        this.lng = lng;
        this.valid = valid;
        this.satellites = satellites;
    }

    public double getLat() {
        return lat;
    }

    public void setLat(double lat) {
        this.lat = lat;
    }

    public double getLng() {
        return lng;
    }

    public void setLng(double lng) {
        this.lng = lng;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public int getSatellites() {
        return satellites;
    }

    public void setSatellites(int satellites) {
        this.satellites = satellites;
    }
}
