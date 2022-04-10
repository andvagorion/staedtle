/* exported AutoComplete */
'use strict';

class AutoComplete {

    constructor(input, items) {
        this.input = input;
        this.items = items;

        this.prev = null;
        this.active = false;
        this.idx = -1;

        this.init();
    }

    init() {
        const html = `<div class="autocomplete"></div>`;
        this.input.insertAdjacentHTML('afterend', html);
        this.container = document.querySelector('.autocomplete');

        this.input.addEventListener('keydown', (evt) => this.onKey(evt));
        this.input.addEventListener('input', (evt) => this.onInput(evt));
    }

    onInput(evt) {
        this.close();

        const curr = this.input.value;

        if (curr == null || curr.length < 1 || curr === this.prev) {
            return;
        }

        this.prev = curr;

        this.open(curr);
    }

    onKey(evt) {
        if (!this.active) {
            return true;
        }

        if (evt.key === 'Enter' && this.idx >= 0) {
            evt.preventDefault();
            evt.stopPropagation();

            this.selectItem();
        } else if (evt.key === 'ArrowDown') {
            evt.preventDefault();
            evt.stopPropagation();

            this.nextItem();
        } else if (evt.key === 'ArrowUp') {
            evt.preventDefault();
            evt.stopPropagation();

            this.prevItem();
        }

        return false;
    }

    selectItem() {
        if (this.idx >= 0) {
            this.setInput(this.currentElement().innerText);
            this.close();
        }
    }

    prevItem() {
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

    nextItem() {
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

    currentElement() {
        return this.container.children[this.idx];
    }

    open(inputValue) {
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

        this.active = true;
    }

    setInput(item) {
        this.close();
        this.input.value = item;
        this.input.focus();
    }

    close() {
        this.container.innerHTML = '';

        this.prev = null;
        this.active = false;
        this.idx = -1;
    }

}