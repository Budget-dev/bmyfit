import fs from "fs";
import path from "path";

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== "node_modules" && f !== ".next" && f !== ".git") walk(full);
    } else if (full.endsWith(".tsx") || full.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf8");
      if (content.includes("\r\n")) {
        fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
      }
    }
  }
}

walk("./components");
walk("./app");
console.log("Normalized line endings to LF!");

