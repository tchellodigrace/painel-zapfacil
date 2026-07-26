// Salva a nova logo do cliente como /public/logo-cliente.png
const sharp = require("sharp");
const fs = require("fs");

async function main() {
  const input = "/tmp/logo-cliente/nova-logo-cliente.png";
  const output = "/home/z/my-project/public/logo-cliente.png";

  const meta = await sharp(input).metadata();
  console.log(`Logo original: ${meta.width}x${meta.height} ${meta.format} ${meta.hasAlpha ? "(RGBA)" : ""}`);

  await sharp(input)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(output);

  const out = await sharp(output).metadata();
  console.log(`Nova logo salva: ${out.width}x${out.height} em ${output}`);
  console.log(`Tamanho: ${fs.statSync(output).size} bytes`);
}

main().catch((err) => { console.error(err); process.exit(1); });
