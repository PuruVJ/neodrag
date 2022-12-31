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
const fs      = require('fs');
const glob    = require('tiny-glob/sync');

const processed = Symbol('processed')

module.exports = (UserProps) => {
  const STATE = {
    mapped: null,            // track prepended props
    mapped_dark: null,       // track dark mode prepended props

    target_layer: null,       // layer for props
    target_rule: null,       // :root for props
    target_rule_dark: null,  // :root for dark props
    target_ss: null,         // stylesheet for keyframes/MQs
    target_media_dark: null, // dark media query props
  }

  return {
    postcssPlugin: 'postcss-jit-props',

    async Once (node, {Rule, AtRule}) {
      let target_selector = ':root'

      if (!Object.keys(UserProps).length) {
        return console.warn('postcss-jit-props: Variable source(s) not passed.')
      }

      if (UserProps?.files?.length) {

        const files = UserProps?.files
          .map((file) => glob(file))
          .reduce((flattenedFileList, files) => flattenedFileList.concat(files), [])

        await Promise.all(files.map(async file => {
          let data = fs.readFileSync(file, 'utf8')
          let result = await postcss([(function(){})]).process(data, { from: undefined })

          result.root.walkDecls(decl => {
            if (!decl.prop.includes('--')) return
            UserProps[decl.prop] = decl.value
          })

          result.root.walkAtRules(atrule => {
            if (atrule.name === 'custom-media') {
              let media = atrule.params.slice(0, atrule.params.indexOf(' '))
              UserProps[media] = `@custom-media ${atrule.params};`
            }
            else if (atrule.name === 'keyframes') {
              let keyframeName = `--${atrule.params}-@`
              let keyframes = atrule.source.input.css.slice(atrule.source.start.offset, atrule.source.end.offset+1)
              UserProps[keyframeName] = keyframes
            }
          })
        }))
      }

      if (UserProps?.custom_selector) {
        target_selector = UserProps.custom_selector
      }

      STATE.mapped = new Set()
      STATE.mapped_dark = new Set()

      STATE.target_rule = new Rule({ selector: target_selector })
      STATE.target_rule_dark = new Rule({ selector: target_selector })
      STATE.target_media_dark = new AtRule({ name: 'media', params: '(prefers-color-scheme: dark)' })

      if (UserProps?.layer) {
        STATE.target_layer = new AtRule({ name: 'layer', params: UserProps.layer })
        node.root().prepend(STATE.target_layer)
        STATE.target_ss = STATE.target_layer
      }
      else
        STATE.target_ss = node.root()
    },

    AtRule (atrule) {
      // bail early if possible
      if (atrule.name !== 'media' || atrule[processed]) return

      // extract prop from atrule params
      let prop = atrule.params.replace(/[( )]+/g, '');

      // bail if media prop already prepended
      if (STATE.mapped.has(prop)) return

      // create :root {} context just in time
      if (STATE.mapped.size === 0)
        STATE.target_ss.prepend(STATE.target_rule)

      // lookup prop value from pool
      let value = UserProps[prop] || null

      // warn if media prop not resolved
      if (!value) {
        return
      }

      // prepend the custom media
      STATE.target_ss.prepend(value)

      // track work to prevent duplication
      atrule[processed] = true
      STATE.mapped.add(prop)
    },

    Declaration (node, {Declaration}) {
      // bail early
      if (node[processed] || !node.value) return
      // console.log(node)
      let matches = node.value.match(/var\(\s*(--[\w\d-_]+)/g)

      if (!matches) return

      // create :root {} context just in time
      if (STATE.mapped.size === 0)
        STATE.target_ss.prepend(STATE.target_rule)

      let props = matches.map(v => v.replace('var(', '').trim())

      for (let prop of props) {
        // bail prepending this prop if it's already been done
        if (STATE.mapped.has(prop)) continue

        // lookup prop from options object
        let value = UserProps[prop] || null

        // warn if props won't resolve from plugin
        if (!value) {
          continue
        }

        // create and append prop to :root
        let decl = new Declaration({ prop, value })
        STATE.target_rule.append(decl)
        STATE.mapped.add(prop)

        // lookup keyframes for the prop and append if found
        let keyframes = UserProps[`${prop}-@`]
        keyframes && STATE.target_ss.append(keyframes)

        // lookup dark adaptive prop and append if found
        let adaptive = UserProps[`${prop}-@media:dark`]
        if (adaptive && !STATE.mapped_dark.has(prop)) {
          // create @media ... { :root {} } context just in time
          if (STATE.mapped_dark.size === 0) {
            STATE.target_media_dark.append(STATE.target_rule_dark)
            STATE.target_ss.append(STATE.target_media_dark)
          }

          // append adaptive prop definition to dark media query
          let darkdecl = new Declaration({ prop, value: adaptive })
          STATE.target_rule_dark.append(darkdecl)
          STATE.mapped_dark.add(prop)
        }

        // track work to prevent duplicative processing
        node[processed] = true
      }
    }
  }
}

module.exports.postcss = true
