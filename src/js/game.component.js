/* global Cities, States, AutoComplete, Point, ResultDialog */
/* exported Game */
'use strict';

const STATE = 0;
const NAME = 1;
const LAT = 2;
const LON = 3;

class Game {

    constructor() {
        this.round = 0;
        this.guesses = [];

        this.results = document.querySelector('.results');
        this.input = document.querySelector('#guess');

        this.input.form.onsubmit = (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            this.submit();
        };

        this.evaluateParams();

        const cityNames = Cities.map(city => city[NAME]);
        this.ac = new AutoComplete(this.input, cityNames);
        this.resultDialog = new ResultDialog();

        document.querySelector('.change-theme').addEventListener('click', () => {
            document.body.classList.toggle('light');
            document.body.classList.toggle('dark');
        });

        this.input.focus();
    }

    evaluateParams() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });

        if (params.game) {
            this.city = this.parseHash(params.game);
            this.gameHash = params.game;
        } else {
            const idx = Math.floor(Math.random() * Cities.length);
            this.city = Cities[idx];
            this.gameHash = this.createHash(idx);
        }
    }

    parseHash(hash) {
        const num = parseInt(hash, 16);
        return Cities[num % Cities.length];
    }

    createHash(num) {
        const min = 100_000;
        const max = 1_000_000;

        const pseudoRnd = Math.floor(Math.random() * (max - min + 1)) + min;
        const hashNum = pseudoRnd - (pseudoRnd % Cities.length) + num;

        return hashNum.toString(16);
    }

    addResult(city, correct = false, dist = 0, angle = 0) {
        const state = States.byId(city[STATE]);

        this.guesses.push({
            city: city,
            correct: correct,
            dist: dist,
            angle: angle
        });

        let arrow = null;
        if (correct) {
            arrow = '<i class="fa-solid fa-face-laugh-beam"></i>';
        } else {
            const rotAngle = angle - 45;
            const rot = `transform: rotate(${rotAngle}deg)`;
            arrow = `<i class="fa-solid fa-location-arrow" style="${rot}"></i>`;
        }

        const html =
            `<div class="result row flex slide-in">
                <div class="name flex-dynamic">
                    <span>${city[NAME]}</span>
                    <span class="state">${state}</span>
                </div>
                <div class="dir flex-fixed">${arrow}</div>
                <div class="dist flex-fixed">${dist} km</dist>
            </div>`;

        this.results.insertAdjacentHTML('beforeend', html);
    }

    submit() {

        const value = this.input.value.trim();
        const findCity = city => city[NAME].toLowerCase() === value.toLowerCase();

        if (!Cities.some(findCity)) {
            this.markInvalid();
            return;
        }

        const guessed = Cities.find(findCity);

        if (this.guesses.map(g => g.city[NAME]).some(name => name === guessed[NAME])) {
            this.markInvalid();
            return;
        }

        if (this.city === guessed) {
            this.addResult(guessed, true);
            this.gameEnded(true);
            return;
        }

        const p1 = new Point(guessed[LAT], guessed[LON]);
        const p2 = new Point(this.city[LAT], this.city[LON]);

        const direction = GeoUtils.angle(p1, p2);
        const distance = GeoUtils.distance(p1, p2);

        this.addResult(guessed, false, distance, direction);
        this.advanceRound();

        this.input.value = '';
        this.ac.close();
        this.input.focus();
    }

    markInvalid() {
        const parent = this.input.parentElement;
        parent.querySelectorAll('.not-found').forEach(el => {
            parent.removeChild(el);
        });

        const html = `<div class="not-found"><i class="fa-solid fa-xmark"></i></div>`;
        this.input.insertAdjacentHTML('afterend', html);
    }

    advanceRound() {
        this.round += 1;

        if (this.round > 4) {
            this.gameEnded();
        }

    }

    gameEnded(perfect = false) {
        this.input.parentElement.remove(this.input);

        const bestGuess = this.guesses.reduce((a, b) => {
            if (a == null) { return b; }
            else if (b.dist < a.dist) { return b; }
            else { return a; }
        }, null);

        const html = `
            <div class="result row flex goal">
                <div class="name flex-dynamic">
                    <span>${this.city[NAME]}</span>
                    <span class="state">${States.byId(this.city[STATE])}</span>
                </div>
                <div class="dir flex-fixed reload clickable"><i class="fa-solid fa-arrow-rotate-right"></i></div>
                <div class="dist flex-fixed show-result-details clickable"><i class="fa-solid fa-circle-info"></i></div>
            </div>`;

        document.querySelector('.container').insertAdjacentHTML('beforeend', html);

        if (perfect) {
            this.results.lastChild.classList.add('perfect');
        } else {
            this.results.children[this.guesses.indexOf(bestGuess)].classList.add('best');
        }

        document.querySelector('.reload').addEventListener('click', () => window.location.reload());
        document.querySelector('.show-result-details').addEventListener('click', () => {
            this.resultDialog.open({
                city: this.city,
                guesses: this.guesses,
                gameHash: this.gameHash
            });
        });
    }

}
