module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "ready on",
      url: ["http://localhost:3000"],
    },
    upload: {
      target: "filesystem",
      outputDir: "./lhci-reports",
    },
  },
};