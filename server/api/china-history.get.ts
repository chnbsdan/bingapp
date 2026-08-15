// server/api/china-history.get.ts
export default defineEventHandler(async () => {
    try {
        // 使用 useStorage 读取 serverAssets 中的文件
        const data = await useStorage('assets:server').getItem('archive/data.json');
        
        if (!data) {
            console.error('❌ archive/data.json 不存在');
            return [];
        }

        // data 是字符串，需要解析
        const parsed = typeof data === 'string' ? JSON.parse(data) : data;
        
        // 如果是数组，直接返回
        if (Array.isArray(parsed)) {
            console.log(`✅ 返回 ${parsed.length} 条数据`);
            return parsed;
        }
        
        // 如果是对象，转换为数组
        const result = Object.keys(parsed)
            .sort((a, b) => b.localeCompare(a))
            .map(key => ({
                startdate: parsed[key].startdate || key,
                urlbase: parsed[key].urlbase || parsed[key].url || '',
                title: parsed[key].title || '',
                copyright: parsed[key].copyright || '',
            }));
        
        console.log(`✅ 返回 ${result.length} 条数据`);
        return result;

    } catch (error) {
        console.error('❌ 读取失败:', error.message);
        return [];
    }
});
