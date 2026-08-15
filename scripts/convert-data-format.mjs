// scripts/convert-data-format.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const dataFilePath = path.join(rootDir, 'archive', 'data.json');

// 读取现有数据
const content = fs.readFileSync(dataFilePath, 'utf-8');
const currentData = JSON.parse(content);

console.log(`📂 当前数据包含 ${Object.keys(currentData).length} 条记录`);
console.log('📋 数据键示例:', Object.keys(currentData).slice(0, 5));

// 检查是否是数组格式（键是数字索引）
const keys = Object.keys(currentData);
const isArrayFormat = keys.every(key => /^\d+$/.test(key));

if (!isArrayFormat) {
    console.log('✅ 数据已经是对象格式，无需转换');
    process.exit(0);
}

console.log('🔄 检测到数组格式，开始转换为对象格式...');

// 转换为对象格式
const convertedData = {};
let convertedCount = 0;

keys.forEach(key => {
    const item = currentData[key];
    if (item && item.startdate) {
        convertedData[item.startdate] = item;
        convertedCount++;
    }
});

console.log(`✅ 转换完成，共 ${convertedCount} 条数据`);

// 按日期排序（最新的在前）
const sortedData = Object.keys(convertedData)
    .sort((a, b) => b.localeCompare(a))
    .reduce((acc, key) => {
        acc[key] = convertedData[key];
        return acc;
    }, {});

// 写入文件
fs.writeFileSync(dataFilePath, JSON.stringify(sortedData, null, 2));
console.log(`💾 已保存到 ${dataFilePath}`);
console.log(`📊 总计 ${Object.keys(sortedData).length} 天的数据`);
