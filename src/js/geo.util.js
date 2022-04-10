/* exported GeoUtils */
'use strict';

const GeoUtils = {

    deg2rad: function (deg) {
        return deg * (Math.PI / 180);
    },

    rad2deg: function (rad) {
        return rad / (Math.PI / 180);
    },

    distance: function (p1, p2) {
        const RADIUS_EARTH = 6378.1370;

        const lat1 = this.deg2rad(p1.x);
        const lon1 = this.deg2rad(p1.y);

        const lat2 = this.deg2rad(p2.x);
        const lon2 = this.deg2rad(p2.y);

        const delta_lat = lat2 - lat1;
        const delta_lon = lon2 - lon1;

        const a = Math.sin(delta_lat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(delta_lon / 2) ** 2;
        const c = 2 * Math.asin(Math.sqrt(a));

        return Math.round(RADIUS_EARTH * c);
    },

    angle: function (p1, p2) {
        const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle = this.rad2deg(rad);

        return angle < 0 ? angle + 360 : angle;
    },

    direction: function (p1, p2) {
        const angle = this.getAngle(p1, p2);
        if (angle < 22.5) {
            return 'north';
        } else if (angle < 67.5) {
            return 'northeast';
        } else if (angle < 112.5) {
            return 'east';
        } else if (angle < 157.5) {
            return 'southeast';
        } else if (angle < 202.5) {
            return 'south';
        } else if (angle < 247.5) {
            return 'southwest';
        } else if (angle < 292.5) {
            return 'west';
        } else if (angle < 337.5) {
            return 'northwest';
        } else {
            return 'north';
        }
    }
};