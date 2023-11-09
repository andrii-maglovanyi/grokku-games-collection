const path = require("path");

const prefix = ".next";

let baseBundle;

try {
  baseBundle = require("../.next/analyze/main/bundle-sizes.json");
} catch (error) {
  // Handle the error, and set baseBundle to an empty object
  baseBundle = {
    pageSizes: {},
    jsLayoutFiles: {},
    cssLayoutFiles: {},
  };
}

const currentBundle = require("../.next/app-build-manifest.json");

const outDir = path.join(process.cwd(), prefix, "analyze");
const outJSONFile = path.join(outDir, "bundle-sizes.json");
const outTXTFile = path.join(outDir, "bundle-sizes.txt");

module.exports = {
  baseBundle,
  currentBundle,
  outDir,
  outJSONFile,
  outTXTFile,
  prefix,
};
