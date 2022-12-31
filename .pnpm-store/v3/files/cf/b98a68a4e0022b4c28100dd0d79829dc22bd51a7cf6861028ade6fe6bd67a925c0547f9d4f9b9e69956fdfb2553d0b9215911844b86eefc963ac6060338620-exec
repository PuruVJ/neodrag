#!/usr/bin/env node
"use strict";let argv=process.argv.slice(2);if(argv.includes("-h")||argv.includes("--help")){let e="";e+=`
  Usage
    $ tsm [options] -- <command>
`,e+=`
  Options`,e+=`
    --tsmconfig    Configuration file path (default: tsm.js)`,e+=`
    --quiet        Silence all terminal messages`,e+=`
    --version      Displays current version`,e+=`
    --help         Displays this message
`,e+=`
  Examples`,e+=`
    $ tsm server.ts`,e+=`
    $ node -r tsm input.jsx`,e+=`
    $ node --loader tsm input.jsx`,e+=`
    $ NO_COLOR=1 tsm input.jsx --trace-warnings`,e+=`
    $ tsm server.tsx --tsmconfig tsm.mjs
`,console.log(e),process.exit(0)}(argv.includes("-v")||argv.includes("--version"))&&(console.log("tsm, v2.3.0"),process.exit(0));let{URL,pathToFileURL}=require("url");argv=["--enable-source-maps","--loader",new URL("loader.mjs",pathToFileURL(__filename)).href,...argv],require("child_process").spawn("node",argv,{stdio:"inherit"}).on("exit",process.exit);
