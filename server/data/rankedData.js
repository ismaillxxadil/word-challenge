import fs from "fs";
import path from "path";
import { randomInt } from "crypto";

const IN_PATH = path.resolve("center_3letters.txt");
const OUT_CSV = path.resolve("center_ranked_output.csv");
const OUT_TOP = path.resolve("center_top_output.txt");

// نفس التطبيع اللي تستخدمه في السيرفر
function normalizeArabic(input) {
  return (input || "")
    .replace(/[\u064B-\u065F\u0670]/g, "") // تشكيل
    .replace(/\u0640/g, "") // ـ
    .replace(/[أإآ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ى")
    .replace(/\s+/g, "")
    .trim();
}

// قائمة الحروف (عدّلها حسب اللي تسمحه لعبتك)
const AR_LETTERS = [
  "ا",
  "ب",
  "ت",
  "ث",
  "ج",
  "ح",
  "خ",
  "د",
  "ذ",
  "ر",
  "ز",
  "س",
  "ش",
  "ص",
  "ض",
  "ط",
  "ظ",
  "ع",
  "غ",
  "ف",
  "ق",
  "ك",
  "ل",
  "م",
  "ن",
  "ه",
  "و",
  "ي",
  "ى",
];

// Load 3-letter words
const words = fs
  .readFileSync(IN_PATH, "utf-8")
  .split(/\r?\n/)
  .map(normalizeArabic)
  .filter((w) => w.length === 3);

const unique = [...new Set(words)];
const dictSet = new Set(unique);

function neighborsOneChange(word) {
  const arr = [...word];
  const neigh = [];

  for (let i = 0; i < 3; i++) {
    const original = arr[i];
    for (const ch of AR_LETTERS) {
      if (ch === original) continue;
      arr[i] = ch;
      const candidate = arr.join("");
      if (dictSet.has(candidate)) neigh.push(candidate);
    }
    arr[i] = original;
  }

  // remove duplicates (لو حصلت بسبب تطبيع)
  return [...new Set(neigh)];
}

const results = unique.map((w) => {
  const neigh = neighborsOneChange(w);
  // خذ أمثلة قليلة للعرض
  const examples = neigh.slice(0, 10).join(" ");
  return { word: w, score: neigh.length, examples };
});

// Sort by score desc
results.sort((a, b) => b.score - a.score);

// Write CSV
const csv = [
  "word,score,examples",
  ...results.map(
    (r) => `${r.word},${r.score},"${r.examples.replace(/"/g, '""')}"`,
  ),
].join("\n");

fs.writeFileSync(OUT_CSV, csv, "utf-8");

// Write Top N
const TOP_N = 300;
fs.writeFileSync(
  OUT_TOP,
  results
    .slice(0, TOP_N)
    .map((r) => r.word)
    .join("\n"),
  "utf-8",
);

console.log(`✅ Done. Words: ${unique.length}`);
console.log(`📄 Ranked CSV: ${OUT_CSV}`);
console.log(`⭐ Top ${TOP_N}: ${OUT_TOP}`);
console.log(`Top 10 preview:`);
console.log(results.slice(0, 10));
