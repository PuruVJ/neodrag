import l from"repl";import{transform as c}from"@esbuild-kit/core-utils";import{v as i}from"./package-9965a5cf.js";console.log(`Welcome to tsx v${i} (Node.js ${process.version}).
Type ".help" for more information.`);const e=l.start(),{eval:m}=e,p=async function(r,t,o,s){const n=await c(r,o,{loader:"ts",tsconfigRaw:{compilerOptions:{preserveValueImports:!0}},define:{require:"global.require"}}).catch(a=>(console.log(a.message),{code:`
`}));return m.call(this,n.code,t,o,s)};e.eval=p;
