'use strict';

class States {
    static names = ['Schleswig-Holstein',
        'Hamburg',
        'Niedersachsen',
        'Bremen',
        'Nordrhein-Westfalen',
        'Hessen',
        'Rheinland-Pfalz',
        'Baden-Württemberg',
        'Bayern',
        'Saarland',
        'Berlin',
        'Brandenburg',
        'Mecklenburg-Vorpommern',
        'Sachsen',
        'Sachsen-Anhalt',
        'Thüringen'];

    static byId = (str) => {
        const idx = parseInt(str) - 1;
        return States.names[idx];
    };
}
