/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const plugins = [withBundleAnalyzer];

const nextConfig = {}

module.exports = () => plugins.reduce((acc, next) => next(acc), nextConfig);