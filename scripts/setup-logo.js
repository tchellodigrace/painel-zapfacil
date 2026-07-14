const sharp = require("sharp");
const fs = require("fs");

async function main() {
  const input = "/home/z/my-project/upload/pro sem fundo.png";
  const publicDir = "/home/z/my-project/public";

  // Generate PWA icons
  await sharp(input).resize(192, 192, { fit: "contain", background: { r: 5, g: 150, b: 105, alpha: 1 } }).png().toFile(`${publicDir}/icon-192.png`);
  await sharp(input).resize(512, 512, { fit: "contain", background: { r: 5, g: 150, b: 105, alpha: 1 } }).png().toFile(`${publicDir}/icon-512.png`);
  console.log("PWA icons generated from logo.");

  // Generate favicon
  await sharp(input).resize(32, 32, { fit: "contain" }).png().toFile(`${publicDir}/favicon.ico`);
  console.log("Favicon generated.");

  // Generate base64 for default logo in store
  const optimized = await sharp(input).resize(300, 300, { fit: "contain" }).png().toBuffer();
  const base64 = `data:image/png;base64,${optimized.toString("base64")}`;
  console.log(`Base64 length: ${base64.length}`);
  
  // Save base64 to a temp file for reference
  fs.writeFileSync("/home/z/my-project/public/logo-base64.txt", base64);
  console.log("Base64 saved.");
}

main().catch(console.error);