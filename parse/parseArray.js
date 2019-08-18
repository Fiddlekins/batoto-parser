import parseItem from './parseItem.js';

function getElementsFromItemsString(itemsString) {
    const elements = [];
    let escapedSemiColon = false;
    let braceCounter = 0;
    let inSpeechmarks = false;
    let elementStartIndex = 0;
    for (let charIndex = 0; charIndex < itemsString.length; charIndex++) {
        const char = itemsString[charIndex];
        switch (char) {
            case ';':
                if (!inSpeechmarks && !escapedSemiColon) {
                    elements.push(itemsString.slice(elementStartIndex, charIndex));
                    elementStartIndex = charIndex + 1;
                }
                break;
            case '"':
                if (itemsString[charIndex - 1] !== '\\') {
                    inSpeechmarks = !inSpeechmarks;
                }
                break;
            case '{':
                if (!inSpeechmarks) {
                    braceCounter++;
                    escapedSemiColon = true;
                }
                break;
            case '}':
                if (!inSpeechmarks) {
                    braceCounter--;
                    if (!braceCounter) {
                        escapedSemiColon = false;
                        elements.push(itemsString.slice(elementStartIndex, charIndex + 1));
                        elementStartIndex = charIndex + 1;
                    }
                }
                break;
        }
    }
    if (inSpeechmarks) {
        throw new Error(`Finished parsing itemsString whilst still in speechmarks`);
    }
    if (braceCounter > 0) {
        throw new Error(`Finished parsing itemsString with non-zero braceCounter`);
    }
    const finalElement = itemsString.slice(elementStartIndex);
    // finalElement is important if last breakpoint was a `;` but not if it was a `}`
    if (finalElement.length) {
        elements.push(finalElement);
    }
    return elements;
}

function parseItemsString(itemsString) {
    // format of items in array take format of key;value; where key and value are typed data
    // thus, we split itemsString by ; and lump pairs together
    const elements = getElementsFromItemsString(itemsString);
    const items = [];
    let item;
    for (let elementIndex = 0; elementIndex < elements.length; elementIndex++) {
        const element = elements[elementIndex];
        if (elementIndex % 2 === 0) {
            item = {
                key: element
            }
            items.push(item);
        } else {
            item.value = element;
        }
    }
    // validate item
    items.forEach(item => {
        if (!item.key) {
            throw new Error(`Parsed item missing key ${item}`)
        }
        if (!item.value) {
            throw new Error(`Parsed item missing value ${item}`)
        }
    });
    // parse keys and values
    return items.map(item => {
        return {
            key: parseItem(item.key),
            value: parseItem(item.value)
        };
    });
}

function parseArray(data) {
    const match = data.match(/^a:([0-9]+):{/);
    if (!match) {
        throw new Error(`Unrecognised array metadata: ${data}`);
    }
    const [fullMatch, itemCountString] = match;
    const itemCount = parseInt(itemCountString, 10);
    const openingBraceIndex = fullMatch.indexOf('{');
    let closingBraceIndex;
    for (let charIndex = data.length - 1; charIndex >= 0; charIndex--) {
        if (data[charIndex] === '}') {
            closingBraceIndex = charIndex;
            break;
        }
    }
    const itemsString = data.slice(openingBraceIndex + 1, closingBraceIndex);
    const items = parseItemsString(itemsString);
    // validate count
    if (items.length !== itemCount) {
        throw new Error(`Parsed items are different in number to declared itemCount:\n ${data}\n\n ${JSON.stringify(items)}`);
    }
    // Check if array should be returned
    const keysAllIntegers = items.every(item => {
        return typeof item.key === 'number';
    });
    if (keysAllIntegers) {
        const array = [];
        items.forEach(item => {
            array[item.key] = item.value;
        });
        array.forEach(item => {
            if (typeof item === 'undefined') {
                throw new Error(`Parsed array has holes in ${data}`);
            }
        })
        return array;
    }
    // Check if object should be returned
    const keysAllStrings = items.every(item => {
        return typeof item.key === 'string';
    });
    if (keysAllStrings) {
        const object = {};
        items.forEach(item => {
            object[item.key] = item.value;
        });
        return object;
    }
    throw new Error(`Array contains items with mixed or unrecognised type keys: ${data}`);
}

export default parseArray;
