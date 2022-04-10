const STORAGE_KEY = 'staedtle.stats';

const Stats = {

    show: function () {
        const stats = this.loadStats();

        const html = `
            <div class="overlay"></div>
            <div class="modal stats centered">
                <div class="close-dialog big-icon in-corner clickable">
                    <i class="fa-solid fa-xmark"></i>
                </div>
                <h2 class="row">Statistik</h2>
                <div class="row">
                    <p>Gespielt: ${stats.gamesPlayed}</p>
                </div>
                <div class="rounds row"></div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);


        if (stats.gamesPlayed > 0) {

            const container = document.querySelector('.rounds');
            [0, 1, 2, 3, 4, 5].forEach(num => {
                const res = parseInt(stats.rounds[num]);
                const pct = res / stats.gamesPlayed * 100;
                const val = res > 4 ? 'x' : num + 1;
                const round = `
                    <div class="round flex">
                        <div class="num flex-static">${val}</div>
                        <div class="line flex-dynamic"><div style="width: ${pct}%;">&nbsp;</div></div>
                    </div>`;
                container.insertAdjacentHTML('beforeend', round);
            });

            const average = `
                <div class="row">
                    <div class="average">Durchschnittliche Distanz: ${this.roundDecimal(stats.averageDistance)} km</div>
                </div>`;
            container.insertAdjacentHTML('afterend', average);

        }

        Modal.makeClosable();
    },

    roundDecimal: function (num) {
        return (Math.round(num * 100) / 100).toFixed(2);
    },

    loadStats: function () {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw != null) {
            return JSON.parse(raw);
        }

        return {
            gamesPlayed: 0,
            rounds: [0, 0, 0, 0, 0, 0],
            averageDistance: -1
        };
    },

    storeGame: function (rounds, dist) {
        const stats = this.loadStats();
        stats.gamesPlayed += 1;
        stats.rounds[rounds] += 1;
        stats.averageDistance = this.addToAverageDistance(stats.gamesPlayed, stats.averageDistance, dist);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    },

    addToAverageDistance: function (gamesPlayed, current, distance) {
        return (gamesPlayed * current + distance) / (gamesPlayed + 1);
    }

};