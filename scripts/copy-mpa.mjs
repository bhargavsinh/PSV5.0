/**
 * After `vite build`, copy the static MPA over generated index.html so
 * Vercel/Nitro serve Pushti Sahitya pages instead of the React shell.
 */
import { cpSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const src = join(root, "public");

const dests = [
  join(root, "dist"),
  join(root, "dist/client"),
  join(root, ".output/public"),
  join(root, ".vercel/output/static"),
];

function copyInto(dest) {
  if (!existsSync(dest) || !statSync(dest).isDirectory()) return false;
  cpSync(src, dest, { recursive: true });
  console.log("[copy-mpa] copied public/ →", dest);
  return true;
}

let n = 0;
for (const d of dests) {
  if (copyInto(d)) n++;
}

if (n === 0) {
  /* vite/nitro may emit a nested client dir we did not list */
  const dist = join(root, "dist");
  if (existsSync(dist)) {
    for (const name of readdirSync(dist)) {
      const p = join(dist, name);
      if (statSync(p).isDirectory() && existsSync(join(p, "index.html"))) {
        if (copyInto(p)) n++;
      }
    }
  }
}

console.log("[copy-mpa] destinations updated:", n);
