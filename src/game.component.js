/* global Cities, States, AutoComplete, Point */
/* exported Game */
'use strict';

const STATE = 0;
const NAME = 1;
const LAT = 2;
const LON = 3;

const BASE_PATH = 'https://stefangaertner.net/staedtle';

class Game {

    constructor() {
        this.round = 0;
        this.bestGuess = {
            dist: 10000,
            idx: -1
        };

        this.results = document.querySelector('.results');
        this.input = document.querySelector('#guess');

        this.input.form.onsubmit = (evt) => {
            evt.preventDefault();
            this.submit();
        };

        this.evaluateParams();
        console.log(this.city);

        const cityNames = Cities.map(city => city[NAME]);
        this.ac = new AutoComplete(this.input, cityNames);

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

    addResult(name, state, correct = false, dist = 0, angle = 0) {
        let arrow = null;
        if (correct) {
            arrow = '<i class="fa-solid fa-face-laugh-beam"></i>';
        } else {
            const rotAngle = angle - 45;
            const rot = `transform: rotate(${rotAngle}deg)`;
            arrow = `<i class="fa-solid fa-location-arrow" style="${rot}"></i>`;
        }

        const html =
            `<div class="result row slide-in">
                <div class="name">
                    <span>${name}</span>
                    <span class="state">${state}</span>
                </div>
                <div class="dir">${arrow}</div>
                <div class="dist">${dist} km</dist>
            </div>`;

        this.results.insertAdjacentHTML('beforeend', html);
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    rad2deg(rad) {
        return rad / (Math.PI / 180);
    }

    distanceBetween(p1, p2) {
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
    }

    getAngle(p1, p2) {
        const rad = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angle = this.rad2deg(rad);

        return angle < 0 ? angle + 360 : angle;
    }

    directionBetween(p1, p2) {
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

    submit() {

        const value = this.input.value.trim();
        const findCity = city => city[NAME].toLowerCase() === value.toLowerCase();

        if (!Cities.some(findCity)) {
            const parent = this.input.parentElement;
            parent.querySelectorAll('.not-found').forEach(el => {
                parent.removeChild(el);
            });

            const html = `<div class="not-found"><i class="fa-solid fa-xmark"></i></div>`;
            this.input.insertAdjacentHTML('afterend', html);
            return;
        }

        const guessed = Cities.find(findCity);
        const state = States.byId(guessed[STATE]);

        if (this.city === guessed) {
            this.addResult(guessed[NAME], state, true);
            this.gameEnded(true);
            return;
        }

        const p1 = new Point(guessed[LAT], guessed[LON]);
        const p2 = new Point(this.city[LAT], this.city[LON]);

        const direction = this.getAngle(p1, p2);
        const distance = this.distanceBetween(p1, p2);

        this.addResult(value, state, false, distance, direction);
        this.advanceRound(distance);

        this.input.value = '';
        this.ac.close();
        this.input.focus();
    }

    advanceRound(distance) {

        if (distance < this.bestGuess.dist) {
            this.bestGuess.dist = distance;
            this.bestGuess.idx = this.round;
        }

        this.round += 1;

        if (this.round > 4) {
            this.gameEnded();
        }

    }

    gameEnded(perfect = false) {
        this.input.parentElement.remove(this.input);

        const html = `
            <div class="result row goal">
                <div class="name">
                    <span>${this.city[NAME]}</span>
                    <span class="state">${States.byId(this.city[STATE])}</span>
                </div>
                <div class="dir reload clickable"><i class="fa-solid fa-arrow-rotate-right"></i></div>
                <div class="dist show-result-details clickable"><i class="fa-solid fa-circle-info"></i></div>
            </div>`;

        document.querySelector('.container').insertAdjacentHTML('beforeend', html);

        if (perfect) {
            this.results.lastChild.classList.add('perfect');
        } else {
            this.results.children[this.bestGuess.idx].classList.add('best');
        }

        document.querySelector('.reload').addEventListener('click', () => window.location.reload());
        document.querySelector('.show-result-details').addEventListener('click', () => this.openResultDetails());
    }

    openResultDetails() {
        const URL = `${BASE_PATH}?game=${this.gameHash}`;

        const html = `
            <div class="overlay"></div>
            <div class="modal">
                <div class="result">
                    <span class="name">${this.city[NAME]}</span>
                    <span class="state">${States.byId(this.city[STATE])}</span>
                </div>
                <div class="result">
                    <div class="clickable share">Share / Challenge</div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        document.querySelector('.overlay').addEventListener('click', () => this.hideResultDetails());
        document.body.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.hideResultDetails();
            }
        }, { once: true });

        document.querySelector('.share').addEventListener('click', () => {
            URL;
        });
    }

    hideResultDetails() {
        const overlay = document.querySelector('.overlay');
        const modal = document.querySelector('.modal');
        modal.remove();
        overlay.remove();
    }

}
