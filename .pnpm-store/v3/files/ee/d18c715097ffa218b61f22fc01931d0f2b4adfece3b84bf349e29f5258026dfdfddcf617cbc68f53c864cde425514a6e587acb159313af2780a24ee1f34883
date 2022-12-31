const source_map_1 = require("@volar/source-map");
const parseSfc_1 = require("../utils/parseSfc");
const plugin = () => {
    return {
        version: 1,
        parseSFC(fileName, content) {
            if (fileName.endsWith('.md')) {
                content = content
                    // code block
                    .replace(/```[\s\S]+?```/g, match => '```' + ' '.repeat(match.length - 6) + '```')
                    // inline code block
                    .replace(/`[^\n`]+?`/g, match => `\`${' '.repeat(match.length - 2)}\``)
                    // # \<script setup>
                    .replace(/\\\<[\s\S]+?\>\n?/g, match => ' '.repeat(match.length));
                const sfcBlockReg = /\<(script|style)\b[\s\S]*?\>([\s\S]*?)\<\/\1\>/g;
                const codeGen = [];
                for (const match of content.matchAll(sfcBlockReg)) {
                    if (match.index !== undefined) {
                        const matchText = match[0];
                        codeGen.push([matchText, undefined, match.index]);
                        codeGen.push('\n\n');
                        content = content.substring(0, match.index) + ' '.repeat(matchText.length) + content.substring(match.index + matchText.length);
                    }
                }
                content = content
                    // angle bracket: <http://foo.com>
                    .replace(/\<\S*\:\S*\>/g, match => ' '.repeat(match.length))
                    // [foo](http://foo.com)
                    .replace(/\[[\s\S]*?\]\([\s\S]*?\)/g, match => ' '.repeat(match.length));
                codeGen.push('<template>\n');
                codeGen.push([content, undefined, 0]);
                codeGen.push('\n</template>');
                const file2VueSourceMap = new source_map_1.SourceMap((0, source_map_1.buildMappings)(codeGen));
                const sfc = (0, parseSfc_1.parse)((0, source_map_1.toString)(codeGen));
                if (sfc.descriptor.template) {
                    transformRange(sfc.descriptor.template);
                }
                if (sfc.descriptor.script) {
                    transformRange(sfc.descriptor.script);
                }
                if (sfc.descriptor.scriptSetup) {
                    transformRange(sfc.descriptor.scriptSetup);
                }
                for (const style of sfc.descriptor.styles) {
                    transformRange(style);
                }
                for (const customBlock of sfc.descriptor.customBlocks) {
                    transformRange(customBlock);
                }
                return sfc;
                function transformRange(block) {
                    var _a, _b, _c, _d;
                    block.loc.start.offset = (_b = (_a = file2VueSourceMap.toSourceOffset(block.loc.start.offset)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : -1;
                    block.loc.end.offset = (_d = (_c = file2VueSourceMap.toSourceOffset(block.loc.end.offset)) === null || _c === void 0 ? void 0 : _c[0]) !== null && _d !== void 0 ? _d : -1;
                }
            }
            ;
        }
    };
};
module.exports = plugin;
//# sourceMappingURL=file-md.js.map