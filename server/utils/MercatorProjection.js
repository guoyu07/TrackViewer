var wktParser = require('terraformer-wkt-parser');
// import wktParser from 'terraformer-wkt-parser';

class MercatorProjection {
    constructor() {
        this.WGS84 = {
            EQUATORIALRADIUS: 6378137.0,
            POLARRADIUS: 6356752.3142,
            INVERSEFLATTENING: 298.257223563
        };
        this.TileSize = 256;
    }

    /**
     * Convert a longitude coordinate (in degrees) to a horizontal distance in
     * meters from the zero meridian.
     *
     * @param longitude
     *            in degrees
     * @return longitude in meters in spherical mercator projection
     */
    longitudeToMetersX(longitude) {
        return this.WGS84.EQUATORIALRADIUS * ((Math.PI * longitude) / 180);
    }

    /**
     * Convert a meter measure to a longitude.
     *
     * @param x
     *            in meters
     * @return longitude in degrees in spherical mercator projection
     */
    metersXToLongitude(x) {
        return (180 * x) / (Math.PI * this.WGS84.EQUATORIALRADIUS);
    }

    /**
     * Convert a meter measure to a latitude.
     *
     * @param y
     *            in meters
     * @return latitude in degrees in spherical mercator projection
     */
    metersYToLatitude(y) {
        return (180 / Math.PI) * Math.atan(Math.sinh(y / this.WGS84.EQUATORIALRADIUS));
    }

    /**
     * Convert a latitude coordinate (in degrees) to a vertical distance in
     * meters from the equator.
     *
     * @param latitude
     *            in degrees
     * @return latitude in meters in spherical mercator projection
     */
    latitudeToMetersY(latitude) {
        return this.WGS84.EQUATORIALRADIUS * Math.log(Math.tan(Math.PI / 4 + 0.5 * ((latitude * Math.PI) / 180)));
    }

    /**
     * Calculate the distance on the ground that is represented by a single
     * pixel on the map.
     *
     * @param latitude
     *            the latitude coordinate at which the resolution should be
     *            calculated.
     * @param zoom
     *            the zoom level at which the resolution should be calculated.
     * @return the ground resolution at the given latitude and zoom level.
     */
    calculateGroundResolution(latitude, zoom) {
        return Math.cos(latitude * Math.PI / 180) * 40075016.686
            / (this.TileSize << zoom);
    }

    /**
     * Convert a latitude coordinate (in degrees) to a pixel Y coordinate at a
     * certain zoom level.
     *
     * @param latitude
     *            the latitude coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the pixel Y coordinate of the latitude value.
     */
    latitudeToPixelY(latitude, zoom) {
        const sinLatitude = Math.sin(latitude * Math.PI / 180);
        return (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude))
            / (4 * Math.PI))
            * (this.TileSize << zoom);
    }

    /**
     * Convert a latitude coordinate (in degrees) to a tile Y number at a
     * certain zoom level.
     *
     * @param latitude
     *            the latitude coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the tile Y number of the latitude value.
     */
    latitudeToTileY(latitude, zoom) {
        return this.pixelYToTileY(this.latitudeToPixelY(latitude, zoom), zoom);
    }

    /**
     * Convert a longitude coordinate (in degrees) to a pixel X coordinate at a
     * certain zoom level.
     *
     * @param longitude
     *            the longitude coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the pixel X coordinate of the longitude value.
     */
    longitudeToPixelX(longitude, zoom) {
        return (longitude + 180) / 360 * (this.TileSize << zoom);
    }

    /**
     * Convert a longitude coordinate (in degrees) to the tile X number at a
     * certain zoom level.
     *
     * @param longitude
     *            the longitude coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the tile X number of the longitude value.
     */
    longitudeToTileX(longitude, zoom) {
        return this.pixelXToTileX(this.longitudeToPixelX(longitude, zoom), zoom);
    }

    /**
     * Convert a pixel X coordinate at a certain zoom level to a longitude
     * coordinate.
     *
     * @param pixelX
     *            the pixel X coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the longitude value of the pixel X coordinate.
     */
    pixelXToLongitude(pixelX, zoom) {
        return 360 * ((pixelX / (this.TileSize << zoom)) - 0.5);
    }

    pixelXToLongitudeWithMod(x, pixelX, zoom) {
        // 获取左下角X像素坐标
        let pixXMin = this.tileXToPixelX(x);

        pixXMin += pixelX;

        return this.pixelXToLongitude(pixXMin, zoom);
    }

    /**
     * Convert a pixel X coordinate to the tile X number.
     *
     * @param pixelX
     *            the pixel X coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the tile X number.
     */
    pixelXToTileX(pixelX, zoom) {
        return Math.min(Math.max(pixelX / this.TileSize, 0), Math.pow(2, zoom) - 1);
    }

    /**
     * Convert a tile X number to a pixel X coordinate.
     *
     * @param tileX
     *            the tile X number that should be converted
     * @return the pixel X coordinate
     */
    tileXToPixelX(tileX) {
        return tileX * this.TileSize;
    }

    /**
     * Convert a tile Y number to a pixel Y coordinate.
     *
     * @param tileY
     *            the tile Y number that should be converted
     * @return the pixel Y coordinate
     */
    tileYToPixelY(tileY) {
        return tileY * this.TileSize;
    }

    /**
     * Convert a pixel Y coordinate at a certain zoom level to a latitude
     * coordinate.
     *
     * @param pixelY
     *            the pixel Y coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the latitude value of the pixel Y coordinate.
     */
    pixelYToLatitude(pixelY, zoom) {
        const y = 0.5 - (pixelY / (this.TileSize << zoom));
        return 90 - 360 * Math.atan(Math.exp(-y * 2 * Math.PI)) / Math.PI;
    }

    pixelYToLatitudeWithMod(y, pixelY, zoom) {
        // 获取左下角Y像素坐标
        let pixYMin = this.tileYToPixelY(y);

        pixYMin += pixelY;

        return this.pixelYToLatitude(pixYMin, zoom);
    }

    /**
     * Converts a pixel Y coordinate to the tile Y number.
     *
     * @param pixelY
     *            the pixel Y coordinate that should be converted.
     * @param zoom
     *            the zoom level at which the coordinate should be converted.
     * @return the tile Y number.
     */
    pixelYToTileY(pixelY, zoom) {
        return Math.min(Math.max(pixelY / this.TileSize, 0), Math.pow(2, zoom) - 1);
    }

    /**
     * Convert a tile X number at a certain zoom level to a longitude
     * coordinate.
     *
     * @param tileX
     *            the tile X number that should be converted.
     * @param zoom
     *            the zoom level at which the number should be converted.
     * @return the longitude value of the tile X number.
     */
    tileXToLongitude(tileX, zoom) {
        return this.pixelXToLongitude(tileX * this.TileSize, zoom);
    }

    /**
     * Convert a tile Y number at a certain zoom level to a latitude coordinate.
     *
     * @param tileY
     *            the tile Y number that should be converted.
     * @param zoom
     *            the zoom level at which the number should be converted.
     * @return the latitude value of the tile Y number.
     */
    tileYToLatitude(tileY, zoom) {
        return this.pixelYToLatitude(tileY * this.TileSize, zoom);
    }

    /**
     * Computes the amount of latitude degrees for a given distance in pixel at
     * a given zoom level.
     *
     * @param deltaPixel
     *            the delta in pixel
     * @param lat
     *            the latitude
     * @param zoom
     *            the zoom level
     * @return the delta in degrees
     */
    deltaLat(deltaPixel, lat, zoom) {
        const pixelY = this.latitudeToPixelY(lat, zoom);
        const lat2 = this.pixelYToLatitude(pixelY + deltaPixel, zoom);

        return Math.abs(lat2 - lat);
    }

    /**
     * 计算瓦片的左下、右上端点，返回经纬度
     *
     * @param tileX
     * @param tileY
     * @param zoom
     * @return 左下经度、左下纬度、右上经度、右上纬度
     */
    tileBounds(tileX, tileY, zoom) {

        const minLonX = this.tileXToLongitude(tileX, zoom);

        const maxLonY = this.tileYToLatitude(tileY, zoom);

        const maxLonX = this.tileXToLongitude(tileX + 1, zoom);

        const minLonY = this.tileYToLatitude(tileY + 1, zoom);

        return [minLonX, minLonY, maxLonX, maxLonY];
    }

    /**
     * 获取瓦片的边框wkt
     *
     * @param tileX
     * @param tileY
     * @param zoom
     * @return wkt
     */
    tile2Wkt(tileX, tileY, zoom) {
        const bounds = this.tileBounds(tileX, tileY, zoom);

        let sb = 'POLYGON((';

        sb += bounds[0];

        sb += ' ';

        sb += bounds[1];

        sb += ',';

        sb += bounds[2];

        sb += ' ';

        sb += bounds[1];

        sb += ',';

        sb += bounds[2];

        sb += ' ';

        sb += bounds[3];

        sb += ',';

        sb += bounds[0];

        sb += ' ';

        sb += bounds[3];

        sb += ',';

        sb += bounds[0];

        sb += ' ';

        sb += bounds[1];

        sb += '))';

        return sb;
    }

    lonlat2Pixel(lon, lat, z, x, y) {
        const px = Math.round(this.longitudeToPixelX(lon, z) - x);
        const py = Math.round(this.latitudeToPixelY(lat, z) - y);
        return [px, py];
    }

    getWktWithGap(x, y, z, gap) {
        let sb = 'POLYGON ((';

        // 获取左下角X像素坐标
        let pixXMin = this.tileXToPixelX(x);

        pixXMin -= gap;

        const lngMin = this.pixelXToLongitude(pixXMin, z);

        // 获取左下角
        let pixYMin = this.tileYToPixelY(y + 1);

        pixYMin += gap;

        const latMin = this.pixelYToLatitude(pixYMin, z);

        // 获取右上角X像素坐标
        let pixXMax = this.tileXToPixelX(x + 1);

        pixXMax += gap;

        const lngMax = this.pixelXToLongitude(pixXMax, z);

        // 获取右上角
        let pixYMax = this.tileYToPixelY(y);

        pixYMax -= gap;

        const latMax = this.pixelYToLatitude(pixYMax, z);

        sb += lngMin;

        sb += ' ';

        sb += latMin;

        sb += ',';

        sb += lngMax;

        sb += ' ';

        sb += latMin;

        sb += ',';

        sb += lngMax;

        sb += ' ';

        sb += latMax;

        sb += ',';

        sb += lngMin;

        sb += ' ';

        sb += latMax;

        sb += ',';

        sb += lngMin;

        sb += ' ';

        sb += latMin;

        sb += '))';

        return sb.toString();
    }

    coord2Pixel(wkt, x, y, z) {
        let coords = [];
        const geometry = wktParser.parse(wkt);
        if (geometry) {
            switch (geometry.type) {
                case 'Point':
                    coords = (this.lonlat2Pixel(geometry.coordinates[0], geometry.coordinates[1], z, x, y));
                    break;
                case 'LineString':
                    for (let i = 0; i < geometry.coordinates.length; i++) {
                        coords.push(this.lonlat2Pixel(geometry.coordinates[i][0], geometry.coordinates[i][1], z, x, y));
                    }
                    break;
                case 'Polygon':
                case 'MultiLineString':
                    for (let i = 0; i < geometry.coordinates.length; i++) {
                        let singleCoords = [];
                        for (let j = 0; j < geometry.coordinates[i].length; j++) {
                            singleCoords.push(this.lonlat2Pixel(geometry.coordinates[i][j][0], geometry.coordinates[i][j][1], z, x, y));
                        }
                        coords.push(singleCoords);
                    }
                    break;
                default:
                    break;
            }
        }

        return coords;
    }
}

// export default new MercatorProjection()
module.exports = new MercatorProjection();
