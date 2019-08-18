import fs from 'fs';
import parseItem from './parse/parseItem.js';

function processItem(item) {
    return {
        id: item.Id,
        data: parseItem(item.Data)
    };
}

function main() {
    const inputPath = process.argv[2];
    const json = JSON.parse(fs.readFileSync(inputPath));

    const outputJson = json.map(processItem);

    fs.writeFileSync('output.json', JSON.stringify(outputJson, null, '\t'), 'utf8');
}

main();
