const DELTA = 2;

describe('Result.dialog', function () {

    it(`Should place most eastern point correctly (x = 410 ± ${DELTA})`, function () {
        const lon = 15.041885779417116, lat = 51.27304207410869;
        const p = ResultDialog.prototype.toPixels(new Coordinates(lon, lat));
        expect(p.x).to.be.closeTo(MAP_WIDTH, DELTA);
    });

    it(`Should place most western point correctly (x = 0 ± ${DELTA})`, function () {
        const lon = 5.86635492777692, lat = 51.051088270047934;
        const p = ResultDialog.prototype.toPixels(new Coordinates(lon, lat));
        expect(p.x).to.be.closeTo(0, DELTA);
    });

    it(`Should place most northern point correctly (y = 0 ± ${DELTA})`, function () {
        const lon = 8.416745070684454, lat = 55.058338060937054;
        const p = ResultDialog.prototype.toPixels(new Coordinates(lon, lat));
        expect(p.y).to.be.closeTo(0, DELTA);
    });

    it(`Should place most southern point correctly (y = 555 ± ${DELTA})`, function () {
        const lon = 10.178330771591707, lat = 47.27013389847596;
        const p = ResultDialog.prototype.toPixels(new Coordinates(lon, lat));
        expect(p.y).to.be.closeTo(MAP_HEIGHT, DELTA);
    });

});
