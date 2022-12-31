"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFileFromTarball = exports.isRelativePath = exports.createDirectory = exports.fileExists = exports.directoryExists = exports.writeJsonFile = exports.readJsonFile = void 0;
const tslib_1 = require("tslib");
const json_1 = require("./json");
const fs_1 = require("fs");
const path_1 = require("path");
const tar = require("tar-stream");
const zlib_1 = require("zlib");
/**
 * Reads a JSON file and returns the object the JSON content represents.
 *
 * @param path A path to a file.
 * @param options JSON parse options
 * @returns Object the JSON content of the file represents
 */
function readJsonFile(path, options) {
    const content = (0, fs_1.readFileSync)(path, 'utf-8');
    if (options) {
        options.endsWithNewline = content.charCodeAt(content.length - 1) === 10;
    }
    try {
        return (0, json_1.parseJson)(content, options);
    }
    catch (e) {
        e.message = e.message.replace('JSON', path);
        throw e;
    }
}
exports.readJsonFile = readJsonFile;
/**
 * Serializes the given data to JSON and writes it to a file.
 *
 * @param path A path to a file.
 * @param data data which should be serialized to JSON and written to the file
 * @param options JSON serialize options
 */
function writeJsonFile(path, data, options) {
    (0, fs_1.mkdirSync)((0, path_1.dirname)(path), { recursive: true });
    const serializedJson = (0, json_1.serializeJson)(data, options);
    const content = (options === null || options === void 0 ? void 0 : options.appendNewLine)
        ? `${serializedJson}\n`
        : serializedJson;
    (0, fs_1.writeFileSync)(path, content, { encoding: 'utf-8' });
}
exports.writeJsonFile = writeJsonFile;
/**
 * Check if a directory exists
 * @param path Path to directory
 */
function directoryExists(path) {
    try {
        return (0, fs_1.statSync)(path).isDirectory();
    }
    catch (_a) {
        return false;
    }
}
exports.directoryExists = directoryExists;
/**
 * Check if a file exists.
 * @param path Path to file
 */
function fileExists(path) {
    try {
        return (0, fs_1.statSync)(path).isFile();
    }
    catch (_a) {
        return false;
    }
}
exports.fileExists = fileExists;
function createDirectory(path) {
    (0, fs_1.mkdirSync)(path, { recursive: true });
}
exports.createDirectory = createDirectory;
function isRelativePath(path) {
    return (path === '.' ||
        path === '..' ||
        path.startsWith('./') ||
        path.startsWith('../'));
}
exports.isRelativePath = isRelativePath;
/**
 * Extracts a file from a given tarball to the specified destination.
 * @param tarballPath The path to the tarball from where the file should be extracted.
 * @param file The path to the file inside the tarball.
 * @param destinationFilePath The destination file path.
 * @returns True if the file was extracted successfully, false otherwise.
 */
function extractFileFromTarball(tarballPath, file, destinationFilePath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(destinationFilePath), { recursive: true });
            var tarExtractStream = tar.extract();
            const destinationFileStream = (0, fs_1.createWriteStream)(destinationFilePath);
            let isFileExtracted = false;
            tarExtractStream.on('entry', function (header, stream, next) {
                if (header.name === file) {
                    stream.pipe(destinationFileStream);
                    stream.on('end', () => {
                        isFileExtracted = true;
                    });
                    destinationFileStream.on('close', () => {
                        resolve(destinationFilePath);
                    });
                }
                stream.on('end', function () {
                    next();
                });
                stream.resume();
            });
            tarExtractStream.on('finish', function () {
                if (!isFileExtracted) {
                    reject();
                }
            });
            (0, fs_1.createReadStream)(tarballPath).pipe((0, zlib_1.createGunzip)()).pipe(tarExtractStream);
        });
    });
}
exports.extractFileFromTarball = extractFileFromTarball;
//# sourceMappingURL=fileutils.js.map