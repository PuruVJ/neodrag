import { test } from 'uvu';
import { is, type } from 'uvu/assert';
import { resolve } from 'path';
import load from '@proload/core';
import typescript from '@proload/plugin-tsm';

test.before(() => {
    load.use([typescript]);
})

test('sanity', () => {
    type(typescript, 'object');
})

const fixtures = ['ts', 'ts-config', 'cts', 'mts'];

for (const fixture of fixtures) {
    test(fixture, async () => {
        let mdl = await load('test', { cwd: resolve(`fixtures/${fixture}`) });
        is(mdl.value.value, fixture)
    });
}

test.run();
