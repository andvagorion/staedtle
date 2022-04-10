'use strict';

const Modal = {

    makeClosable: function () {
        document.querySelector('.overlay').addEventListener('click', () => this.hide());
        document.body.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.hide();
            }
        }, { once: true });
        document.querySelector('.close-dialog').addEventListener('click', () => this.hide());
    },

    hide: function () {
        const overlay = document.querySelector('.overlay');
        const modal = document.querySelector('.modal');
        modal.remove();
        overlay.remove();
    }

};