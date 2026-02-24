import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.post("/add", (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim() === '') {
      return res.status(400).json({ success: false, error: "كلمة غير صالحة" });
    }

    const cleanWord = word.trim();
    
    // The dictionary file path
    const dictionaryPath = path.join(__dirname, '..', 'data', 'center_3letters.txt');
    
    // Check if the word already exists to avoid duplicates
    const fileContent = fs.readFileSync(dictionaryPath, 'utf8');
    const existingWords = fileContent.split('\n').map(w => w.trim());
    
    if (existingWords.includes(cleanWord)) {
      return res.status(200).json({ success: true, message: "الكلمة موجودة مسبقاً في القاموس" });
    }
    
    // Append the word to the file with a newline
    fs.appendFileSync(dictionaryPath, `\n${cleanWord}`);
    
    console.log(`[Dictionary] Added new approved word: ${cleanWord}`);
    
    return res.status(200).json({ success: true, message: "تم إضافة الكلمة بنجاح" });
    
  } catch (error) {
    console.error("Error adding word to dictionary:", error);
    return res.status(500).json({ success: false, error: "حدث خطأ أثناء تحديث القاموس" });
  }
});

router.post("/remove", (req, res) => {
  try {
    const { word } = req.body;
    
    if (!word || typeof word !== 'string' || word.trim() === '') {
      return res.status(400).json({ success: false, error: "كلمة غير صالحة" });
    }

    const cleanWord = word.trim();
    const dictionaryPath = path.join(__dirname, '..', 'data', 'center_3letters.txt');
    
    // Read and filter out the word
    const fileContent = fs.readFileSync(dictionaryPath, 'utf8');
    const existingWords = fileContent.split('\n');
    
    const initialLength = existingWords.length;
    const newWords = existingWords.filter(w => w.trim() !== cleanWord);
    
    if (newWords.length === initialLength) {
      return res.status(200).json({ success: true, message: "الكلمة غير موجودة في القاموس مسبقاً" });
    }
    
    // Write back to the file
    fs.writeFileSync(dictionaryPath, newWords.join('\n'));
    
    console.log(`[Dictionary] Removed word: ${cleanWord}`);
    
    return res.status(200).json({ success: true, message: "تم حذف الكلمة بنجاح" });
    
  } catch (error) {
    console.error("Error removing word from dictionary:", error);
    return res.status(500).json({ success: false, error: "حدث خطأ أثناء تحديث القاموس" });
  }
});

export default router;
