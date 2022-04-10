describe('Stats.util', function () {

    it('Should initially retrieve empty object', function () {
        localStorage.clear();

        const val = Stats.loadStats();

        expect(val).to.not.be.null;
        expect(val).to.be.an('object');

        expect(val).to.have.all.keys('gamesPlayed', 'rounds', 'averageDistance');

        expect(val.gamesPlayed).to.equal(0);

        expect(val.rounds).to.be.an('array');
        expect(val.rounds.some(i => i > 0)).to.be.false;

        expect(val.averageDistance).to.equal(0);

    });

    it('Should correctly save values', function () {
        localStorage.clear();

        Stats.storeGame(3, 15);

        const val = Stats.loadStats();

        expect(val).to.not.be.null;
        expect(val).to.have.all.keys('gamesPlayed', 'rounds', 'averageDistance');

        expect(val.gamesPlayed).to.equal(1);

        expect(val.rounds).to.eql([0, 0, 0, 1, 0, 0]);

        expect(val.averageDistance).to.equal(15);

    });

    it('Should correctly calculate average', function () {
        localStorage.clear();

        Stats.storeGame(5, 15);
        Stats.storeGame(5, 28);
        Stats.storeGame(5, 17);
        Stats.storeGame(5, 9);
        Stats.storeGame(5, 139);
        Stats.storeGame(5, 32);

        const val = Stats.loadStats();

        expect(val.averageDistance).to.equal(40);

    });

});