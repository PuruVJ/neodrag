/**
 * Copyright 2020 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const postcss = require('postcss')
const plugin = require('./')

const MockProps = {
  '--red': '#f00',
  '--pink': '#ffc0cb',
  '--h': 200,
  '--s': '50%',
  '--l': '50%',
  '--size-1': '1rem',
  '--size-2': '2rem',
  '--fade-in': 'fade-in .5s ease',
  '--fade-in-@': '@keyframes fade-in {to { opacity: 1 }}',
  '--dark': '@custom-media --dark (prefers-color-scheme: dark);',
  '--text': 'white',
  '--text-@media:dark': 'black',
}

async function run (input, output, options = { }) {
  let result = await postcss([plugin(options)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('Can jit a single prop', async () => {
  await run(
`a {
  color: var(--red);
}`, 
`:root {
  --red: #f00;
}
a {
  color: var(--red);
}`, 
  MockProps
  )
})

it('Can jit a single prop with spaces', async () => {
  await run(
`a {
  color: var( --red );
}`,
`:root {
  --red: #f00;
}
a {
  color: var( --red );
}`,
  MockProps
  )
})

it('Can jit a single prop that has fallbacks', async () => {
  await run(
`a {
  color: var(--red, hotpink);
}`, 
`:root {
  --red: #f00;
}
a {
  color: var(--red, hotpink);
}`, 
  MockProps
  )
})

it('Can jit a single prop with spaces that has fallbacks', async () => {
  await run(
`a {
  color: var(  --red, hotpink);
}`,
`:root {
  --red: #f00;
}
a {
  color: var(  --red, hotpink);
}`,
  MockProps
  )
})

it('Can jit a single prop that has fallbacks and nested props', async () => {
  await run(
`a {
  color: var(--red, var(--pink), hotpink);
}`, 
`:root {
  --red: #f00;
  --pink: #ffc0cb;
}
a {
  color: var(--red, var(--pink), hotpink);
}`, 
  MockProps
  )
})

it('Can jit a single, undefined prop that has fallbacks and nested props', async () => {
  await run(
`a {
  color: var(--orange, var(--pink), hotpink);
}`, 
`:root {
  --pink: #ffc0cb;
}
a {
  color: var(--orange, var(--pink), hotpink);
}`, 
  MockProps
  )
})


it('Can jit a single prop with spaces that has fallbacks and nested props', async () => {
  await run(
`a {
  color: var( --red, var( --pink ), hotpink);
}`,
`:root {
  --red: #f00;
  --pink: #ffc0cb;
}
a {
  color: var( --red, var( --pink ), hotpink);
}`,
  MockProps
  )
})

it('Can jit multiple props', async () => {
  await run(
`a {
  color: var(--red);
  border-color: var(--pink);
  padding-block-start: var( --size-1 );
}`, 
`:root {
  --red: #f00;
  --pink: #ffc0cb;
  --size-1: 1rem;
}
a {
  color: var(--red);
  border-color: var(--pink);
  padding-block-start: var( --size-1 );
}`, 
  MockProps
  )
})

it('Can jit multiple props from shorthand', async () => {
  await run(
`a {
  padding-block: var(--size-1) var( --size-2  );
}`, 
`:root {
  --size-1: 1rem;
  --size-2: 2rem;
}
a {
  padding-block: var(--size-1) var( --size-2  );
}`, 
  MockProps
  )
})

it('Can jit props from inside functions', async () => {
  await run(
`a {
  color: hsl(var(--h) var(--s) var( --l ));
}`, 
`:root {
  --h: 200;
  --s: 50%;
  --l: 50%;
}
a {
  color: hsl(var(--h) var(--s) var( --l ));
}`, 
  MockProps
  )
})

it('Only adds a prop one time to :root', async () => {
  await run(
`a {
  color: var(--red);
  border-color: var(--red );
}`, 
`:root {
  --red: #f00;
}
a {
  color: var(--red);
  border-color: var(--red );
}`, 
  MockProps
  )
})

it('Can jit props into a layer', async () => {
  await run(
`a {
  color: hsl(var(--h) var(--s) var( --l ));
}`, 
`@layer test {
  :root {
    --h: 200;
    --s: 50%;
    --l: 50%;
  }
}
a {
  color: hsl(var(--h) var(--s) var( --l ));
}`, 
  {
    ... MockProps,
    layer: 'test',
  }
  )
})

it('Can jit a keyframe animation', async () => {
  await run(
`a {
  animation: var(--fade-in);
}`, 
`:root {
  --fade-in: fade-in .5s ease;
}a {
  animation: var(--fade-in);
}@keyframes fade-in {to { opacity: 1 }}`, 
  MockProps
  )
})

it('Can jit @custom-media', async () => {
  await run(
`@media (--dark) {
  a {
    color: white;
  }
}`, 
`@custom-media --dark (prefers-color-scheme: dark);
:root{}
@media (--dark) {
  a {
    color: white;
  }
}`, 
  MockProps
  )
})

it('Can jit @custom-media with spaces', async () => {
  await run(
`@media ( --dark ) {
  a {
    color: white;
  }
}`,
`@custom-media --dark (prefers-color-scheme: dark);
:root{}
@media ( --dark ) {
  a {
    color: white;
  }
}`,
  MockProps
  )
})

it('Can jit props from JSON', async () => {
  await run(
`a {
  color: var(--red);
  border-color: var( --pink  );
}`,
`:root {
  --red: #f00;
  --pink: #ffc0cb;
}
a {
  color: var(--red);
  border-color: var( --pink  );
}`,
  MockProps
  )
})

it('Can jit props from a CSS file', async () => {
  await run(
`@media (--dark) {
  a {
    color: var(--red);
    border-color: var( --pink );
    animation: var(--fade-in);
  }
}`, 
`@custom-media --dark (prefers-color-scheme: dark);
:root{
  --red: #f00;
  --pink: #ffc0cb;
  --fade-in: fade-in .5s ease;
}
@media (--dark) {
  a {
    color: var(--red);
    border-color: var( --pink );
    animation: var(--fade-in);
  }
}
@keyframes fade-in {to { opacity: 1 }}`, 
  { files: ['./props.test.css']}
  )
})

it('Can jit props from a CSS file via glob', async () => {
  await run(
`@media (--dark) {
  a {
    color: var(--red);
    border-color: var( --pink );
    animation: var(--fade-in);
  }
}`, 
`@custom-media --dark (prefers-color-scheme: dark);
:root{
  --red: #f00;
  --pink: #ffc0cb;
  --fade-in: fade-in .5s ease;
}
@media (--dark) {
  a {
    color: var(--red);
    border-color: var( --pink );
    animation: var(--fade-in);
  }
}
@keyframes fade-in {to { opacity: 1 }}`, 
  { files: ['./*.test.css']}
  )
})

it('Can fail without srcProps options gracefully', async () => {
  console.warn = jest.fn()
  await postcss([plugin({})]).process(``, { from: undefined })

  expect(console.warn).toHaveBeenCalledWith('postcss-jit-props: Variable source(s) not passed.')
})

it('Can jit props to a custom selector', async () => {
  await run(
`a {
  color: var(--red);
}`, 
`:global {
  --red: #f00;
}
a {
  color: var(--red);
}`, 
  {
    ... MockProps,
    custom_selector: ':global',
  }
  )
})

it('Wont create a :root {} context unless props are found', async () => {
  await run(
`a {
  color: red;
}`, 
`a {
  color: red;
}`, 
  {
    ... MockProps
  }
  )
})

it('Can jit a light and dark adaptive prop', async () => {
  await run(
`p {
  color: var(--text);
}`, 
`:root {
  --text: white;
}
p {
  color: var(--text);
}
@media (prefers-color-scheme: dark) {
  :root {
    --text: black;
  }
}`, 
  MockProps
  )
})
