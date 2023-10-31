module.exports = {
  ci: {
    assert: {
      preset: "lighthouse:recommended",
    },
    collect: {
      staticDistDir: ".next",
    },
    upload: {
      target: "lhci",
      url: "https://andrii-maglovanyi.github.io/grokku-games-collection/",
    },
  },
};