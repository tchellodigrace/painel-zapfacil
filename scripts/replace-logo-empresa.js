// Substitui /public/logo-empresa.png pela nova logo (180x180 PNG)
// Mantém a resolução original, mas garante formato PNG otimizado
const sharp = require("sharp");
const fs = require("fs");

async function main() {
  const input = "/tmp/logo-download/nova-logo.png";
  const publicDir = "/home/z/my-project/public";

  // Verifica dimensões da imagem original
  const meta = await sharp(input).metadata();
  console.log(`Logo original: ${meta.width}x${meta.height} ${meta.format} ${meta.hasAlpha ? "(RGBA)" : "(sem alpha)"}`);

  // Otimiza a logo: mantém dimensões originais, mas aplica compressão PNG otimizada
  // A imagem vai aparecer dentro de containers 240x60 ou 144x36, mas com object-contain
  // Em telas Retina (2x), precisamos de pelo menos 480x120 para nitidez
  // Logo quadrada 180x180 -> vamos manter 180x180 que já é suficiente
  await sharp(input)
    .png({ quality: 90, compressionLevel: 9 })
    .toFile(`${publicDir}/logo-empresa.png`);

  // Verifica o resultado
  const out = await sharp(`${publicDir}/logo-empresa.png`).metadata();
  console.log(`Nova logo salva: ${out.width}x${out.height} ${out.format}`);
  console.log(`Tamanho: ${fs.statSync(`${publicDir}/logo-empresa.png`).size} bytes`);
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
