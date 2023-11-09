

const { processFiles, calcFileSizes, exportStatsToFile } = require("./methods");
const { baseBundle, currentBundle, outTXTFile } = require("./config");



const formatBytes = (bytes, signed = false) => {
  const sign = signed ? (bytes < 0 ? "-" : "+") : "";
  if (bytes === 0) return `${sign}0B`;

  const k = 1024;
  const dm = 2;
  const sizes = ["B", "kB", "mB", "gB", "tB"];

  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));

  return `${sign}${parseFloat(Math.abs(bytes / Math.pow(k, i)).toFixed(dm))}${
    sizes[i]
  }`;
};

const sortByFilename = (a, b) => a.filename.localeCompare(b.filename);

const renderTableRow = (files, append = 0, baseFiles) => {
    const getFileAndTotalSize = (size) => ({
      fileSize: formatBytes(size),
      totalSize: append ? `**${formatBytes(size + append)}**` : "",
    });


    const baseFilesList = Object.entries(baseFiles);

    const addedFiles = files
      .filter(({name}) => !baseFiles[name])
      .sort(sortByFilename);

console.log("files", files);
console.log("baseFiles", baseFiles);
console.log("baseFilesList", baseFilesList);
console.log('addedFiles', addedFiles)

    const existingFiles = files
      .filter(({name}) => baseFiles[name])
      .sort(sortByFilename);
    const removedFiles = baseFilesList
      .filter(([name]) => {
        console.log(
          "NNN",
          name,
          files.find(({ filename }) => filename !== name),
        );
        return !files.find(({filename}) => filename !== name).map(([filename, size]) => ({filename, size}))
      })
      .sort(sortByFilename);

    console.log("removedFiles", removedFiles);

    const addedRows = addedFiles.map(([filename, size]) => {
        const {fileSize, totalSize} = getFileAndTotalSize(size)

        return `| ➕ | ${filename} | ${fileSize} (+${fileSize}) | ${totalSize} |`;
    })

    const existingRows = existingFiles.map(([filename, size]) => {
      const { fileSize, totalSize } = getFileAndTotalSize(size);
      const delta = size - baseSize;

      const deltaSize = delta ? ` (${formatBytes(delta, true)})` : "";

      return `|| ${filename} | ${fileSize} (+${deltaSize}) | ${totalSize} |`;
    });

    const removedRows = removedFiles.map(([filename, size]) => {
      const fileSize = formatBytes(size);

      return `| ➖ | ${filename} | 0 (-${fileSize}) ||`;
    });

  return [...addedRows, ...existingRows, ...removedRows].join("\n");
}

const renderTitleTableRow = (title, size) =>
  `|| **${title}** | **${formatBytes(size)}**  ||`;


const {jsLayoutFiles, cssLayoutFiles, pages, layoutFilesWithSizes} = processFiles(currentBundle.pages);


const pageSizes = calcFileSizes(pages, layoutFilesWithSizes);

const totalJsLayoutSize = jsLayoutFiles.reduce((s, { size }) => s + size, 0);
const totalCssLayoutSize = cssLayoutFiles.reduce((s, { size }) => s + size, 0);

// Produce a Markdown table with each path, chunk and their size
const output = `# Bundle Size
|| Route | Size | Total size |
|:---:| :--- | :--- | ---: |
${renderTableRow(pageSizes, totalJsLayoutSize, baseBundle.pageSizes)}
|||||
${renderTitleTableRow("JS Shared by all pages", totalJsLayoutSize)}
${renderTableRow(jsLayoutFiles, 0, baseBundle.jsLayoutFiles)}
|||||
${renderTitleTableRow("CSS Shared by all pages", totalCssLayoutSize)}
${renderTableRow(cssLayoutFiles, 0, baseBundle.cssLayoutFiles)}
<!-- GH BOT -->`;

exportStatsToFile(outTXTFile, output);
