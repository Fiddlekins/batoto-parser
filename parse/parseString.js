function parseString(data) {
    const match = data.match(/^s:([0-9]+):"([^"]+)"/);
    if (!match) {
        throw new Error(`Unrecognised string metadata: ${data}`);
    }
    const [, stringLengthString, valueString] = match;
    const stringLength = parseInt(stringLengthString, 10);
    if (valueString.length !== stringLength) {
        throw new Error(`Declared string length differs from parsed string length: ${data}`);
    }
    return valueString;
}

export default parseString;
