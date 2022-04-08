from os import listdir
from os.path import isfile, join

src_path = './src'
out_path = './dist/game.js'

ordered = [
    'states.data.js',
    'cities.data.js',
    'point.util.js',
    'autocomplete.component.js',
    'game.component.js'
]

strict_def = 'use strict';

lines = []

for filename in ordered:
    file_path = src_path + '/' + filename
    with open(file_path, 'r') as f:
        print('including %s' % (file_path))
        lines += f.read().splitlines()

lines = [line for line in lines if strict_def not in line]

out = '\'use strict\';\n' + '\n'.join(lines)

with open(out_path, 'w') as f:
    f.write(out)
