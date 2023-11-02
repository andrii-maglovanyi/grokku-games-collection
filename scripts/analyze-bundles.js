const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const currentBundle = require("../.next/app-build-manifest.json");

const prefix = ".next";
const outDir = path.join(process.cwd(), prefix, "analyze");
const outFile = path.join(outDir, "bundle-sizes.txt");

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
}


const renderTableRow = (files, append = 0) =>
  files
    .map(
      ({ filename, size }) =>
        `| \`${filename}\` | ${formatBytes(size)} | ${append ? `**${formatBytes(size + append)}**` : "" } |`,
    )
    .join("\n");

const renderTitleTableRow = (title, size) =>`| \`${title}\` | ${formatBytes(size)} |  |`;


const {["/layout"] : layoutFiles, ...pages} = currentBundle.pages

const layoutFilesWithSizes = layoutFiles.reduce((files, filename) => {
  const fn = path.join(process.cwd(), prefix, filename);
  const bytes = fs.readFileSync(fn);
  const zippedBytes = zlib.gzipSync(bytes);

  return { ...files, [filename]: zippedBytes.byteLength };
}, {})

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

const totalJsLayoutSize = jsLayoutFiles.reduce((s, { size }) => s + size, 0);
const totalCssLayoutSize = cssLayoutFiles.reduce((s, { size }) => s + size, 0);

const pageSizes = Object.keys(pages).map((page) => {
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


// Produce a Markdown table with each path, chunk and their size
const output = `# Bundle Size
| Route | Size | Total size |
| --- | --- | ---: |
${renderTableRow(pageSizes, totalJsLayoutSize)}
${renderTitleTableRow("JS Shared by all pages", totalJsLayoutSize)}
${renderTableRow(jsLayoutFiles)}
| --- | --- | ---: |
${renderTitleTableRow("CSS Shared by all pages", totalCssLayoutSize)}
${renderTableRow(cssLayoutFiles)}
<!-- GH BOT -->`;

try {
  fs.mkdirSync(outDir);
} catch (e) {
  // Ignore (dir exists)
}

fs.writeFileSync(outFile, output);
