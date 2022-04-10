/* global chai, describe, it */
/* global Game, Cities, MAP_WIDTH, MAP_HEIGHT, Coordinates */

const expect = chai.expect;
const DELTA = 2;

describe('Game.component', function () {

    describe('Create and parse hash', function () {

        it('should create a random hash of length 5 (idx 0)', function () {
            const hash = Game.prototype.createHash(0);
            expect(hash).to.not.be.null;
            expect(hash).to.be.a('string');
            expect(hash).to.have.lengthOf(5);
        });

        it('Should create a random hash of length 5 (idx 2048)', function () {
            const hash = Game.prototype.createHash(2048);
            expect(hash).to.not.be.null;
            expect(hash).to.be.a('string');
            expect(hash).to.have.lengthOf(5);
        });

        it('Should parse the same city for a given hash', function () {
            const idx = 150;
            const city = Cities[idx][1];

            const hash = Game.prototype.createHash(idx);
            const parsed = Game.prototype.parseHash(hash)[1];

            expect(parsed).to.equal(city);
        });

        it(`Should place most eastern point correctly (x = 410 ± ${DELTA})`, function () {
            const lon = 15.041885779417116, lat = 51.27304207410869;
            const p = Game.prototype.toPixels(new Coordinates(lon, lat));
            expect(p.x).to.be.closeTo(MAP_WIDTH, DELTA);
        });

        it(`Should place most western point correctly (x = 0 ± ${DELTA})`, function () {
            const lon = 5.86635492777692, lat = 51.051088270047934;
            const p = Game.prototype.toPixels(new Coordinates(lon, lat));
            expect(p.x).to.be.closeTo(0, DELTA);
        });

        it(`Should place most northern point correctly (y = 0 ± ${DELTA})`, function () {
            const lon = 8.416745070684454, lat = 55.058338060937054;
            const p = Game.prototype.toPixels(new Coordinates(lon, lat));
            expect(p.y).to.be.closeTo(0, DELTA);
        });

        it(`Should place most southern point correctly (y = 555 ± ${DELTA})`, function () {
            const lon = 10.178330771591707, lat = 47.27013389847596;
            const p = Game.prototype.toPixels(new Coordinates(lon, lat));
            expect(p.y).to.be.closeTo(MAP_HEIGHT, DELTA);
        });

    });

});
