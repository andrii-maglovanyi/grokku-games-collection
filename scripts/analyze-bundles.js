const { processFiles, calcFileSizes, exportStatsToFile } = require("./methods");
const { currentBundle, outJSONFile } = require("./config");

const makeList = (filesObject) =>
  filesObject.reduce(
    (acc, { filename, size }) => ({ ...acc, [filename]: size }),
    {},
  );

const { jsLayoutFiles, cssLayoutFiles, pages, layoutFilesWithSizes } =
  processFiles(currentBundle.pages);

const pageSizes = calcFileSizes(pages, layoutFilesWithSizes);

const jsonOutput = JSON.stringify({
  pageSizes: makeList(pageSizes),
  jsLayoutFiles: makeList(jsLayoutFiles),
  cssLayoutFiles: makeList(cssLayoutFiles),
});

exportStatsToFile(outJSONFile, jsonOutput);
