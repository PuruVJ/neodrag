"use strict";
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
let require = createRequire(import.meta.url);

/**
 * 
 * @param {string} filePath 
 */
export default async function requireOrImport(filePath, { middleware = [] } = {}) {
    await Promise.all(middleware.map(plugin => plugin.register(filePath)));

    return new Promise(async (resolve, reject) => {
        try {
            let mdl = require(filePath);
            resolve(mdl);
        } catch (e) {
            if (e.code === 'ERR_REQUIRE_ESM') {
                const fileUrl = pathToFileURL(filePath).toString();
                try {
                    const mdl = await import(fileUrl);
                    return resolve(mdl);
                } catch (e) {
                    reject(e);
                }
            };
            reject(e);
        }
    })
}
