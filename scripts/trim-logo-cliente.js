// Recorta a logo-cliente.png removendo a margem transparente
// para que o conteudo visivel fique centralizado no container.
const sharp = require("sharp");
const fs = require("fs");

async function main() {
  const input = "/home/z/my-project/public/logo-cliente.png";
  const tmpOutput = "/tmp/logo-cliente-trimmed.png";

  // Metadata inicial
  const meta = await sharp(input).metadata();
  console.log(`Logo original: ${meta.width}x${meta.height} ${meta.format} ${meta.hasAlpha ? "(RGBA)" : ""}`);

  // Trim: remove pixels transparentes das bordas (threshold 1 = quase tudo)
  // Recorta para o bounding box dos pixels com alpha > 1
  const trimmed = await sharp(input)
    .trim({ threshold: 1 })
    .toBuffer();
  
  const trimmedMeta = await sharp(trimmed).metadata();
  console.log(`Logo apos trim: ${trimmedMeta.width}x${trimmedMeta.height}`);

  // Agora vamos criar uma versao final com padding simetrico para preservar
  // aspecto proximo de quadrado mas com o conteudo visivel centralizado.
  // Como o conteudo visivel apos trim sera algo como 180x83 (wide),
  // vamos adicionar padding transparente em cima e baixo para chegar em
  // proporcao que funcione bem com containers retangulares ou quadrados.
  
  // Estrategia: apos trim, criar um canvas 400x200 (proporcao 2:1) com a logo centralizada
  // Isso permite usar o mesmo padrao do painel admin (h-[50px] w-[100px] ou retangular wide)
  const targetW = 400;
  const targetH = 200;
  
  await sharp(trimmed)
    .resize({
      width: targetW,
      height: targetH,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ compressionLevel: 9 })
    .toFile(input);
  
  const final = await sharp(input).metadata();
  console.log(`Logo final salva: ${final.width}x${final.height} em ${input}`);
  console.log(`Tamanho: ${fs.statSync(input).size} bytes`);
}

main().catch((err) => { console.error(err); process.exit(1); });
