'use strict';

const BASE_PATH = 'https://stefangaertner.net/staedtle';
const MAP_WIDTH = 410, MAP_HEIGHT = 555;

// eslint-disable-next-line no-unused-vars
class ResultDialog {

    open(options) {
        const html = `
            <div class="overlay"></div>
            <div class="modal maybe-flex centered">
                <div class="close-dialog big-icon in-corner clickable">
                    <i class="fa-solid fa-xmark"></i>
                </div>
                <div class="flex-row">
                    <div class="map">
                        ${MAP}
                    </div>
                </div>
                <div class="flex-row">
                    <div class="row"></div>
                    <div class="row">
                        <h2>${options.city[NAME]}</h2>
                        <p>${States.byId(options.city[STATE])}</p>
                    </div>
                    <div class="clickable share">
                        <i class="fa-solid fa-square-share-nodes"></i>
                        <span>Share / Challenge</span>
                    </div>
                </div>
            </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        const targetCity = new Coordinates(options.city[LON], options.city[LAT]);
        this.addToMap(targetCity);

        Modal.makeClosable();

        document.querySelector('.share').addEventListener('click', () => {
            const str = this.buildShareString(options);
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

    buildShareString(options) {
        const found = options.guesses.some(guess => guess.correct);
        const num = found ? options.guesses.length : 'x';
        const header = `Städtle ${num}/5`;

        const lines = options.guesses.map(guess => {
            return `... ${this.toEmoji(guess)} ${guess.dist} km`;
        }).join('\n');

        const URL = `${BASE_PATH}?game=${options.gameHash}`;

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

    toPixels(coords) {
        const mapBounds = {
            west: 5.865010,
            east: 15.043380,
            north: 55.057722,
            south: 47.269133
        };

        const deltaX = mapBounds.east - mapBounds.west;

        const x = (coords.lon - mapBounds.west) * (MAP_WIDTH / deltaX);

        const bottom = GeoUtils.deg2rad(mapBounds.south);

        const lat = GeoUtils.deg2rad(coords.lat);
        const totalWidth = ((MAP_WIDTH / deltaX) * 360) / (2 * Math.PI);
        const offsetY = (totalWidth / 2 * Math.log((1 + Math.sin(bottom)) / (1 - Math.sin(bottom))));
        const y = MAP_HEIGHT - ((totalWidth / 2 * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat)))) - offsetY);

        return new Point(Math.round(x), Math.round(y));
    }

    copyToClipboard() {
        navigator.clipboard.writeText();
    }

}