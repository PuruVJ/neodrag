"use strict";var c=require("repl"),n=require("@esbuild-kit/core-utils"),i=require("./package-233933a1.cjs");function u(e){return e&&typeof e=="object"&&"default"in e?e:{default:e}}var p=u(c);console.log(`Welcome to tsx v${i.version} (Node.js ${process.version}).
Type ".help" for more information.`);const o=p.default.start(),{eval:f}=o,d=async function(e,t,r,a){const s=await n.transform(e,r,{loader:"ts",tsconfigRaw:{compilerOptions:{preserveValueImports:!0}},define:{require:"global.require"}}).catch(l=>(console.log(l.message),{code:`
`}));return f.call(this,s.code,t,r,a)};o.eval=d;
