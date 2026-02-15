import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文件路径
const inputPath = path.join(__dirname, 'public', 'china-map.json');
const outputPath = path.join(__dirname, 'public', 'china-map.compressed.json');
const backupPath = path.join(__dirname, 'public', 'china-map.backup.json');

console.log('🗺️  GeoJSON 压缩工具\n');
console.log('正在读取地图数据...');

try {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  const originalSize = fs.statSync(inputPath).size;
  console.log(`✓ 原始文件大小: ${(originalSize / 1024).toFixed(2)} KB`);
  
  // 分析数据
  console.log('\n📊 数据分析:');
  console.log(`  - 省份数量: ${data.features.length}`);
  console.log(`  - 第一个省份属性:`, Object.keys(data.features[0].properties).join(', '));
  
  // 计算坐标点总数
  let totalPoints = 0;
  const countPoints = (coords) => {
    if (typeof coords[0] === 'number') return 1;
    return coords.reduce((sum, c) => sum + countPoints(c), 0);
  };
  
  data.features.forEach(feature => {
    totalPoints += countPoints(feature.geometry.coordinates);
  });
  console.log(`  - 总坐标点数: ${totalPoints.toLocaleString()}`);
  
  // 压缩坐标 - 减少小数位数
  const compressCoordinates = (coords, precision = 3) => {
    if (typeof coords[0] === 'number') {
      return coords.map(c => parseFloat(c.toFixed(precision)));
    }
    return coords.map(c => compressCoordinates(c, precision));
  };
  
  console.log('\n🔧 开始压缩...');
  console.log('  - 坐标精度: 3 位小数 (约 110米精度)');
  console.log('  - 保留属性: name, adcode, center');
  
  // 压缩数据
  const compressed = {
    type: data.type,
    features: data.features.map(feature => ({
      type: feature.type,
      properties: {
        name: feature.properties.name,
        adcode: feature.properties.adcode,
        center: feature.properties.center
      },
      geometry: {
        type: feature.geometry.type,
        coordinates: compressCoordinates(feature.geometry.coordinates, 3)
      }
    }))
  };
  
  // 备份原文件
  console.log('\n💾 备份原文件...');
  fs.copyFileSync(inputPath, backupPath);
  console.log('  ✓ 备份保存到: public/china-map.backup.json');
  
  // 保存压缩文件
  console.log('\n💾 保存压缩文件...');
  fs.writeFileSync(outputPath, JSON.stringify(compressed), 'utf8');
  
  const compressedSize = fs.statSync(outputPath).size;
  console.log(`  ✓ 压缩文件: public/china-map.compressed.json`);
  console.log(`  ✓ 压缩后大小: ${(compressedSize / 1024).toFixed(2)} KB`);
  
  const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
  const saved = ((originalSize - compressedSize) / 1024).toFixed(2);
  console.log(`  ✓ 减小: ${reduction}% (节省 ${saved} KB)`);
  
  // 自动替换原文件
  console.log('\n🔄 替换原文件...');
  fs.copyFileSync(outputPath, inputPath);
  console.log('  ✓ 已替换 public/china-map.json');
  console.log('  ✓ 如有问题可从 public/china-map.backup.json 恢复');
  
  console.log('\n✅ 压缩完成!');
  
} catch (error) {
  console.error('\n❌ 错误:', error.message);
  process.exit(1);
}
