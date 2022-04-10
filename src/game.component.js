/* global Cities, States, AutoComplete, Point, Toast, Coordinates, MAP */
/* exported Game */
'use strict';

const STATE = 0;
const NAME = 1;
const LAT = 2;
const LON = 3;

const BASE_PATH = 'https://stefangaertner.net/staedtle';
const MAP_WIDTH = 410, MAP_HEIGHT = 555;

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
                <div class="name">
                    <span>${city[NAME]}</span>
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

        const direction = this.getAngle(p1, p2);
        const distance = this.distanceBetween(p1, p2);

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
            this.results.children[this.guesses.indexOf(bestGuess)].classList.add('best');
        }

        document.querySelector('.reload').addEventListener('click', () => window.location.reload());
        document.querySelector('.show-result-details').addEventListener('click', () => this.openResultDetails());
    }

    toPixels(coords) {
        const mapBounds = {
            west: 5.865010,
            east: 15.043380,
            north: 55.057722,
            south: 47.269133
        };

        const deltaX = mapBounds.east - mapBounds.west;

        const x = (coords.lon - mapBounds.west) * (MAP_WIDTH / deltaX);

        const bottom = this.deg2rad(mapBounds.south);

        const lat = this.deg2rad(coords.lat);
        const totalWidth = ((MAP_WIDTH / deltaX) * 360) / (2 * Math.PI);
        const offsetY = (totalWidth / 2 * Math.log((1 + Math.sin(bottom)) / (1 - Math.sin(bottom))));
        const y = MAP_HEIGHT - ((totalWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - offsetY);

        return new Point(Math.round(x), Math.round(y));
    }

    openResultDetails() {
        const html = `
            <div class="overlay"></div>
            <div class="modal centered">
                <div class="row">
                    <div class="map">
                        ${MAP}
                    </div>
                </div>
                <div class="row">
                    <h2>${this.city[NAME]}</h2>
                    <p>${States.byId(this.city[STATE])}</p>
                    <div class="clickable share">
                        <i class="fa-solid fa-square-share-nodes"></i>
                        <span>Share / Challenge</span>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        const targetCity = new Coordinates(this.city[LON], this.city[LAT]);
        this.addToMap(targetCity);

        document.querySelector('.overlay').addEventListener('click', () => this.hideResultDetails());
        document.body.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.hideResultDetails();
            }
        }, { once: true });

        document.querySelector('.share').addEventListener('click', () => {
            const str = this.buildShareString();
            try {
                navigator.clipboard.writeText(str);
                Toast.toast('Copied to clipboard.');
            } catch (error) {
                console.log(error);
            }
        });
    }

    addToMap(coords) {
        const pxCoords = this.toPixels(coords);
        const pctX = pxCoords.x / MAP_WIDTH * 100;
        const pctY = pxCoords.y / MAP_HEIGHT * 100;
        const html = `
            <div class="map-point" 
                 style="left: ${pctX}%; top: ${pctY}%;">
                 <i class="fa-solid fa-location-dot centered-marker"></i>
            </div>`;
        document.querySelector('.map').insertAdjacentHTML('beforeend', html);
    }

    buildShareString() {
        const found = this.guesses.some(guess => guess.correct);
        const num = found ? this.guesses.length : 'x';
        const header = `Städtle ${num}/5`;

        const lines = this.guesses.map(guess => {
            return `... ${this.toEmoji(guess)} ${guess.dist} km`;
        }).join('\n');

        const URL = `${BASE_PATH}?game=${this.gameHash}`;

        return `${header}\n\n${lines}\n\n${URL}`;
    }

    toEmoji(guess) {
        if (guess.correct) {
            return '☑️';
        }

        const angle = guess.angle + 22.5;
        if (angle < 45) { return '⬆️'; }
        else if (angle < 90) { return '↗️'; }
        else if (angle < 135) { return '➡️'; }
        else if (angle < 180) { return '↘️'; }
        else if (angle < 225) { return '⬇️'; }
        else if (angle < 270) { return '↙️'; }
        else if (angle < 315) { return '⬅️'; }
        else { return '↖️'; }
    }

    hideResultDetails() {
        const overlay = document.querySelector('.overlay');
        const modal = document.querySelector('.modal');
        modal.remove();
        overlay.remove();
    }

    copyToClipboard() {

        navigator.clipboard.writeText();
    }

}
