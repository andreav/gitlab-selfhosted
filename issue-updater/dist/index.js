"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const xml2js_1 = require("xml2js");
const junitFilePath = process.env.JUNIT_FILE_PATH;
if (!junitFilePath) {
    throw new Error("Environment variable JUNIT_FILE_PATH not set");
}
const junitFileContent = (0, fs_1.readFileSync)(junitFilePath);
var junitJsonFileContet = await (0, xml2js_1.parseStringPromise)(junitFileContent);
console.log("to json ->", junitJsonFileContet);
