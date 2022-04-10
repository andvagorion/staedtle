import codecs
from os import listdir
from os.path import isfile, join

src_path = './src'
out_path = './dist/game.js'

ordered = [
    'map.data.js',
    'toast.util.js',
    'point.util.js',
    'coordinates.util.js',
    'states.data.js',
    'cities.data.js',
    'autocomplete.component.js',
    'game.component.js'
]

strict_def = 'use strict';

lines = []

for filename in ordered:
    file_path = src_path + '/' + filename
    with open(file_path, 'r', encoding = 'utf-8') as f:
        print('including %s' % (file_path))
        lines += f.read().splitlines()

lines = [line for line in lines if strict_def not in line]

out = '\'use strict\';\n' + '\n'.join(lines)

with codecs.open(out_path, 'w', 'utf-8') as f:
    f.write(out)
