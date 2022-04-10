/* exported Toast */

const Toast = {

    toaster: null,

    init: function () {
        this.toaster = document.createElement('div');
        this.toaster.classList.add('toaster');
        document.body.appendChild(this.toaster);
    },

    toast: function (str) {
        if (this.toaster == null) {
            this.init();
        }

        this.toaster.innerHTML = '';
        const html = `<div class="toast slide-in">${str}</div>`;
        this.toaster.insertAdjacentHTML('beforeend', html);
    }
};