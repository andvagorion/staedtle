/* exported AutoComplete */
'use strict';

class AutoComplete {

    constructor(input, items) {
        this.input = input;
        this.items = items;

        this.active = false;
        this.idx = -1;

        this.init();
    }

    init() {
        const html = `<div class="autocomplete"></div>`;
        this.input.insertAdjacentHTML('afterend', html);
        this.container = document.querySelector('.autocomplete');

        this.input.addEventListener('keyup', (evt) => this.onkey(evt))
    }

    onkey(evt) {

        if (this.active && evt.key === 'Enter') {
            if (this.idx >= 0) {
                this.setInput(this.currentElement().innerText);
            }
            return;
        }

        if (this.active && evt.key === 'ArrowDown') {
            evt.preventDefault();
            this.nextItem();
            return;
        }

        if (this.active && evt.key === 'ArrowUp') {
            evt.preventDefault();
            this.prevItem();
            return;
        }

        this.closeAutocomplete();

        const inputValue = this.input.value;

        if (!inputValue || inputValue.length < 1) {
            return;
        }

        this.initAutoCompleteItems(inputValue);
        this.active = true;

    }

    prevItem = () => {
        if (this.idx <= 0) {
            return;
        }

        if (this.currentElement()) {
            this.currentElement().classList.remove('selected');
        }
        this.idx--;
        this.currentElement().classList.add('selected');

        this.currentElement().scrollIntoView();
    }

    currentElement() {
        return this.container.children[this.idx];
    }

    nextItem = () => {
        if (this.idx >= this.container.children.length - 1) {
            return;
        }

        if (this.currentElement()) {
            this.currentElement().classList.remove('selected');
        }
        this.idx += 1;
        this.currentElement().classList.add('selected');

        this.currentElement().scrollIntoView();
    }

    initAutoCompleteItems = (inputValue) => {
        const filtered = this.items.filter(name => name.toLowerCase().startsWith(inputValue.toLowerCase()));

        filtered.forEach(item => {
            const div = document.createElement('div');
            div.classList.add('autocomplete-item');
            div.innerText = item;
            this.container.appendChild(div);
            // const html = `<div class="autocomplete-item">${item}</div>`;

            div.addEventListener('click', () => {
                this.setInput(item);
            }, { once: true });
        });
    }

    setInput(item) {
        this.closeAutocomplete();
        this.input.value = item;
        this.input.focus();
    }

    closeAutocomplete = () => {
        this.container.innerHTML = '';
        this.active = false;
        this.idx = -1;
    }

}