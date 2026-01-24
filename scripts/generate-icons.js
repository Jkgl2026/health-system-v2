const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
  72, 96, 128, 144, 152, 167, 180, 192, 384, 512
];

const inputPath = path.join(__dirname, '../public/icons/icon-source.svg');
const outputDir = path.join(__dirname, '../public/icons');

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('开始生成 PWA 图标...');

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ 生成 ${size}x${size} 图标成功`);
    } catch (error) {
      console.error(`✗ 生成 ${size}x${size} 图标失败:`, error.message);
    }
  }

  console.log('\n图标生成完成！');
}

generateIcons().catch(console.error);
