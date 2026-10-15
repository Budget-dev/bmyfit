const fs = require("node:fs");
const path = require("node:path");

const binDir = path.join(__dirname, "..", "node_modules", ".bin");
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const binaries = {
  tsc: "../typescript/bin/tsc",
  vitest: "../vitest/vitest.mjs",
  eslint: "../eslint/bin/eslint.js",
  prettier: "../prettier/bin/prettier.cjs",
};

for (const [name, target] of Object.entries(binaries)) {
  const winTarget = target.split("/").join("\\");
  const cmdPath = path.join(binDir, `${name}.cmd`);
  const cmdContent = `@ECHO off\r\nSETLOCAL\r\nSET dp0=%~dp0\r\nSET _prog=node\r\n"%_prog%" "%dp0%\\${winTarget}" %*\r\n`;
  fs.writeFileSync(cmdPath, cmdContent, "utf8");

  const shPath = path.join(binDir, name);
  const shContent = `#!/bin/sh\nbasedir=$(dirname "$0")\nexec node "$basedir/${target}" "$@"\n`;
  fs.writeFileSync(shPath, shContent, "utf8");
  console.log(`Created bin shims for ${name}`);
}
