// 生成小程序 tabBar 图标
const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const SIZE = 81;

// 创建简单的图标
function createIcon(filename, color, iconType) {
  const png = new PNG({ width: SIZE, height: SIZE });
  
  // 解析颜色
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const idx = (SIZE * y + x) << 2;
      
      let alpha = 0;
      
      if (iconType === 'home') {
        // 房子图标
        const cx = SIZE / 2;
        const cy = SIZE / 2;
        // 屋顶三角形
        if (y >= 15 && y <= 40) {
          const roofWidth = (y - 15) * 1.5;
          if (x >= cx - roofWidth && x <= cx + roofWidth) {
            alpha = 255;
          }
        }
        // 房屋主体
        if (y >= 40 && y <= 65) {
          if (x >= 20 && x <= 61) {
            alpha = 255;
          }
        }
      } else if (iconType === 'solution') {
        // 清单/方案图标
        if (x >= 20 && x <= 61 && y >= 15 && y <= 66) {
          // 外框
          if (x <= 23 || x >= 58 || y <= 18 || y >= 63) {
            alpha = 255;
          }
          // 横线
          if ((y === 30 || y === 40 || y === 50) && x >= 28 && x <= 53) {
            alpha = 255;
          }
        }
      } else if (iconType === 'admin') {
        // 管理员/用户图标
        const cx = SIZE / 2;
        // 头部圆形
        const headY = 25;
        const headR = 12;
        if (Math.sqrt((x - cx) ** 2 + (y - headY) ** 2) <= headR) {
          alpha = 255;
        }
        // 身体
        if (y >= 40 && y <= 62) {
          const bodyWidth = Math.sqrt((y - 35) * 20);
          if (x >= cx - bodyWidth && x <= cx + bodyWidth) {
            alpha = 255;
          }
        }
      }
      
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = alpha;
    }
  }
  
  const buffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(__dirname, 'images', filename), buffer);
  console.log(`Created: ${filename}`);
}

// 创建目录
if (!fs.existsSync(path.join(__dirname, 'images'))) {
  fs.mkdirSync(path.join(__dirname, 'images'));
}

// 生成图标
const grayColor = '#666666';
const activeColor = '#10b981';

createIcon('home.png', grayColor, 'home');
createIcon('home-active.png', activeColor, 'home');
createIcon('solution.png', grayColor, 'solution');
createIcon('solution-active.png', activeColor, 'solution');
createIcon('admin.png', grayColor, 'admin');
createIcon('admin-active.png', activeColor, 'admin');

console.log('\n所有图标已生成！');
