import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.resolve(__dirname, "../firestore.rules.template");
const outputPath = path.resolve(__dirname, "../firestore.rules");

// テンプレートの読み込み
const template = fs.readFileSync(templatePath, "utf8");

// 環境変数からの取得とバリデーション
const adminUid = process.env.FIREBASE_ADMIN_UID;
if (!adminUid) {
  console.error(
    "Error: FIREBASE_ADMIN_UID is not defined in environment variables.",
  );
  process.exit(1);
}

// 置換とファイル書き出し
const generatedRules = template.replace("{{ADMIN_UID}}", adminUid);
fs.writeFileSync(outputPath, generatedRules, "utf8");

console.log("Successfully generated firestore.rules from template.");
