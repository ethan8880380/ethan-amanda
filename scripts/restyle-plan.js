const fs = require("fs");
const path = require("path");

const roots = ["components/planning", "app/plan"];
const skip = new Set([
  path.normalize("components/planning/plan-shell.tsx"),
  path.normalize("components/planning/glyph.tsx"),
  path.normalize("app/plan/login/page.tsx"),
  path.normalize("app/plan/layout.tsx"),
  path.normalize("app/plan/actions.ts"),
]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    if (fs.statSync(filePath).isDirectory()) walk(filePath, out);
    else if (filePath.endsWith(".tsx")) out.push(filePath);
  }
  return out;
}

const files = roots
  .flatMap((root) => walk(root))
  .filter((file) => !skip.has(path.normalize(file)));

const reps = [
  [
    "border border-dashed border-[#d9d0c5] bg-white",
    "rounded-[1.75rem] border border-dashed border-white/15 bg-[#101010]",
  ],
  [
    "border border-[#e4ddd4] bg-white",
    "rounded-[1.75rem] bg-[#161616]",
  ],
  [
    "border border-[#eee6dc] bg-[#f7f3ee]",
    "rounded-2xl bg-black",
  ],
  [
    "border border-[#d9d0c5] bg-white",
    "rounded-2xl border border-white/10 bg-black",
  ],
  [
    "border border-[#d9d0c5] bg-[#fbf8f4]",
    "rounded-2xl border border-white/10 bg-black",
  ],
  ["border bg-white", "rounded-[1.75rem] bg-[#161616]"],
  [
    "border border-[#d9d0c5]",
    "rounded-2xl border border-white/10 bg-black",
  ],
  ["bg-[#1c1714] text-white", "rounded-full bg-white text-black"],
  ["bg-[#1c1714] text-[#f7f3ee]", "rounded-full bg-white text-black"],
  ["bg-[#1c1714]", "rounded-full bg-white"],
  ["text-[#f7f3ee]", "text-black"],
  ["focus:border-[#1c1714]", "focus:border-white/40"],
  ["focus:border-[#d9d0c5]", "focus:border-white/20"],
  ["hover:text-[#1c1714]", "hover:text-white"],
  ["border border-[#1c1714]", "rounded-full border border-white/15"],
  ["accent-[#1c1714]", "accent-white"],
  ["text-[#1c1714]", "text-white"],
  ["text-[#6f6258]", "text-[#8e8e8e]"],
  ["text-[#8a7462]", "text-[#6a6a6a]"],
  ["text-[#a89482]", "text-[#6a6a6a]"],
  ["text-[#4d433c]", "text-[#d4d4d4]"],
  ["text-[#e8dfd4]", "text-[#d4d4d4]"],
  ["text-[#cbb9a8]", "text-[#8e8e8e]"],
  ["bg-[#f7f3ee]", "bg-[#101010]"],
  ["bg-[#fbf8f4]", "bg-black"],
  ["bg-[#efe8df]", "bg-white/10"],
  ["bg-[#d9d0c5]", "bg-white/20"],
  ["border-[#e4ddd4]", "border-white/10"],
  ["border-[#eee6dc]", "border-white/10"],
  ["border-[#d9d0c5]", "border-white/10"],
  ["ring-[#e4ddd4]", "ring-white/10"],
  ["border-red-700", "border-[#ff453a]"],
  ["bg-red-50", "bg-[#2c1515]"],
  ["text-red-800", "text-[#ffb4ab]"],
  ["text-red-700", "text-[#ff453a]"],
  ["rounded-none", "rounded-[1.75rem]"],
];

for (const file of files) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;
  for (const [from, to] of reps) text = text.split(from).join(to);
  text = text.replace(/bg-white(?!\/)/g, "bg-[#161616]");
  text = text.replace(/\bfont-serif\b/g, "font-medium");
  text = text.replaceAll(
    'DrawerContent className="',
    'DrawerContent className="plan scheme-dark ',
  );
  text = text.replaceAll(
    'DialogContent className="',
    'DialogContent className="plan scheme-dark ',
  );
  if (text !== before) {
    fs.writeFileSync(file, text);
    console.log("updated", file);
  } else {
    console.log("unchanged", file);
  }
}
