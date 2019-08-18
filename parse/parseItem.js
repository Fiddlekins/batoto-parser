import parseArray from './parseArray.js';
import parseInteger from './parseInteger.js';
import parseString from './parseString.js';

function parseItem(data) {
    const itemType = data[0];
    switch (itemType) {
        case 'a':
            return parseArray(data);
        case 'i':
            return parseInteger(data);
        case 's':
            return parseString(data);
        default:
            throw new Error(`Unrecognised item type: ${itemType}\n${data}`);
    }
}

export default parseItem;
