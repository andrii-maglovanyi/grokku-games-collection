const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const { outDir, prefix, currentBundle } = require("./config");

const getFileSize = (filename) => {
    const fn = path.join(process.cwd(), prefix, filename);
    const bytes = fs.readFileSync(fn);
    const zippedBytes = zlib.gzipSync(bytes);
    return {[filename]: zippedBytes.byteLength};
}

const processFiles = (bundle) => {
  const { ["/layout"]: layoutFiles, ...pages } = bundle;

  const layoutFilesWithSizes = layoutFiles.reduce((files, filename) => ({ ...files, ...getFileSize(filename) }), {});

  const jsLayoutFiles = [];
  const cssLayoutFiles = [];
  let indexLayoutSize = 0;

  for (const [filename, size] of Object.entries(layoutFilesWithSizes)) {
    if (filename.startsWith("static/chunks/app/layout")) {
      indexLayoutSize = size;
    } else if (filename.endsWith(".css")) {
      cssLayoutFiles.push({ filename, size });
    } else if (filename.endsWith(".js")) {
      jsLayoutFiles.push({ filename, size });
    }
  }

  return {
    jsLayoutFiles,
    cssLayoutFiles,
    indexLayoutSize,
    layoutFilesWithSizes,
    pages,
  };
};

const calcFileSizes = (pages, layoutFilesWithSizes) =>
  Object.keys(pages).map((page) => {
    const files = currentBundle.pages[page];
    const size = files
      .map((filename) => {
        if (layoutFilesWithSizes[filename]) return 0;

        const fn = path.join(process.cwd(), prefix, filename);
        const bytes = fs.readFileSync(fn);
        const zippedBytes = zlib.gzipSync(bytes);
        return zippedBytes.byteLength;
      })
      .reduce((s, b) => s + b, 0);

    return { filename: page.replace("/page", "") || "/", size };
  });

const exportStatsToFile = (outFile, output) => {
    try {
      fs.mkdirSync(outDir);
    } catch (e) {
      // Ignore (dir exists)
    }

    fs.writeFileSync(outFile, output);
}

module.exports = {
  processFiles,
  calcFileSizes,
  exportStatsToFile,
};
