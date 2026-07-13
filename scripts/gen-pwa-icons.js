// Generate PWA icons using Node.js canvas or simple SVG approach
const { writeFileSync } = require("fs");

function generateIcon(size) {
  const r = Math.round(size * 0.2);
  const fs = Math.round(size * 0.4);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" fill="#059669"/>
  <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-family="Arial,sans-serif" font-weight="900" font-size="${fs}" fill="white">ZF</text>
</svg>`;
}

writeFileSync("/home/z/my-project/public/icon-192.svg", generateIcon(192));
writeFileSync("/home/z/my-project/public/icon-512.svg", generateIcon(512));
console.log("PWA SVG icons generated.");

// Convert to PNG using sharp if available
try {
  const sharp = require("sharp");
  Promise.all([
    sharp(Buffer.from(generateIcon(192))).resize(192, 192).png().toFile("/home/z/my-project/public/icon-192.png"),
    sharp(Buffer.from(generateIcon(512))).resize(512, 512).png().toFile("/home/z/my-project/public/icon-512.png"),
  ]).then(() => console.log("PWA PNG icons generated."));
} catch {
  console.log("Sharp not available for PNG conversion. SVG icons will be used.");
}