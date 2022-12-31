/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./dataProvider", "./data/webCustomData", "../utils/arrays"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTMLDataManager = void 0;
    var dataProvider_1 = require("./dataProvider");
    var webCustomData_1 = require("./data/webCustomData");
    var arrays = require("../utils/arrays");
    var HTMLDataManager = /** @class */ (function () {
        function HTMLDataManager(options) {
            this.dataProviders = [];
            this.setDataProviders(options.useDefaultDataProvider !== false, options.customDataProviders || []);
        }
        HTMLDataManager.prototype.setDataProviders = function (builtIn, providers) {
            var _a;
            this.dataProviders = [];
            if (builtIn) {
                this.dataProviders.push(new dataProvider_1.HTMLDataProvider('html5', webCustomData_1.htmlData));
            }
            (_a = this.dataProviders).push.apply(_a, providers);
        };
        HTMLDataManager.prototype.getDataProviders = function () {
            return this.dataProviders;
        };
        HTMLDataManager.prototype.isVoidElement = function (e, voidElements) {
            return !!e && arrays.binarySearch(voidElements, e.toLowerCase(), function (s1, s2) { return s1.localeCompare(s2); }) >= 0;
        };
        HTMLDataManager.prototype.getVoidElements = function (languageOrProviders) {
            var dataProviders = Array.isArray(languageOrProviders) ? languageOrProviders : this.getDataProviders().filter(function (p) { return p.isApplicable(languageOrProviders); });
            var voidTags = [];
            dataProviders.forEach(function (provider) {
                provider.provideTags().filter(function (tag) { return tag.void; }).forEach(function (tag) { return voidTags.push(tag.name); });
            });
            return voidTags.sort();
        };
        return HTMLDataManager;
    }());
    exports.HTMLDataManager = HTMLDataManager;
});
