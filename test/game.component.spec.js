describe('Game.component', function () {

    it('Should create a random hash of length 5 (idx 0)', function () {
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

});
