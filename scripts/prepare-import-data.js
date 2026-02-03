#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// 读取导出文件
const exportFilePath = path.resolve(process.cwd(), 'assets/export-data-20260203-220409.json');
const exportData = JSON.parse(fs.readFileSync(exportFilePath, 'utf-8'));

// 提取需要导入的数据
const importData = {
  data: exportData.data.data
};

// 保存为导入文件
const importFilePath = path.resolve(process.cwd(), 'assets/import-data.json');
fs.writeFileSync(importFilePath, JSON.stringify(importData, null, 2), 'utf-8');

console.log('✅ 导入数据文件已生成: assets/import-data.json');
console.log('📊 统计信息:', exportData.data.statistics);
