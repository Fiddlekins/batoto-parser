function parseInteger(data) {
    const match = data.match(/^i:([0-9]+)/);
    if (!match) {
        throw new Error(`Unrecognised integer metadata: ${data}`);
    }
    const [, valueString] = match;
    return parseInt(valueString, 10);
}

export default parseInteger;
