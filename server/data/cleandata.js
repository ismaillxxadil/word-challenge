import fs from "fs";
import path from "path";

const inputPath = path.resolve("verb.csv");
const outputPath = path.resolve("verb_3letters.txt");

function normalizeArabic(word) {
  return word
    .replace(/[\u064B-\u065F\u0670]/g, "") // tashkeel
    .replace(/\u0640/g, "") // tatweel
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ى")
    .replace(/\s+/g, "")
    .trim();
}

// read csv
const raw = fs.readFileSync(inputPath, "utf-8");

const words = raw
  .split(/\r?\n/)
  .map((w) => normalizeArabic(w))
  .filter((w) => w.length === 3);

// remove duplicates
const uniqueWords = [...new Set(words)];

fs.writeFileSync(outputPath, uniqueWords.join("\n"), "utf-8");

console.log(`✅ Done: ${uniqueWords.length} words saved`);
