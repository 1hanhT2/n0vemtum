import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const distDir = path.join(repoRoot, "dist");
const outFile = path.join(distDir, "index.cjs");

await fs.mkdir(distDir, { recursive: true });

const contents = `\
"use strict";

const path = require("node:path");
const { pathToFileURL } = require("node:url");

const entryUrl = pathToFileURL(path.join(__dirname, "index.js")).href;

import(entryUrl).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
`;

await fs.writeFile(outFile, contents, "utf8");
