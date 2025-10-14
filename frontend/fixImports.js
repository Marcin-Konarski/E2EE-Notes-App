import fs from "fs-extra";
import path from "path";
import { glob } from "glob";  // <-- note the curly braces

const SRC_DIR = "./src";

// Helper: find actual file ignoring case
function findFileInsensitive(filePath) {
  const dir = path.dirname(filePath);
  const base = path.basename(filePath);
  const files = fs.readdirSync(dir);
  const match = files.find(f => f.toLowerCase() === base.toLowerCase());
  return match ? path.join(dir, match) : null;
}

// Find all JS/JSX files
const files = await glob(`${SRC_DIR}/**/*.{js,jsx}`);

for (const file of files) {
  let content = fs.readFileSync(file, "utf8");
  let modified = false;

  content = content.replace(/from\s+['"](.*?)['"]/g, (fullMatch, importPath) => {
    if (!importPath.startsWith(".")) return fullMatch; // skip node_modules

    const fullImportPathJS = path.join(path.dirname(file), importPath + ".js");
    const fullImportPathJSX = path.join(path.dirname(file), importPath + ".jsx");

    if (fs.existsSync(fullImportPathJS) || fs.existsSync(fullImportPathJSX)) {
      return fullMatch; // import is correct
    }

    let realFile = findFileInsensitive(fullImportPathJS) || findFileInsensitive(fullImportPathJSX);
    if (realFile) {
      const relPath = path.relative(path.dirname(file), realFile).replace(/\\/g, "/").replace(/\.jsx?$/, "");
      modified = true;
      console.log(`Fixed import in ${file}: ${importPath} -> ${relPath}`);
      return fullMatch.replace(importPath, relPath);
    }

    return fullMatch;
  });

  if (modified) {
    fs.writeFileSync(file, content, "utf8");
  }
}

console.log("All import mismatches fixed!");
