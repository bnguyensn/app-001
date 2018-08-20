function inputIsNumber(input) {
    return !Number.isNaN(Number(input));
}

function sanitizeNumber(input) {
    if (Number.isNaN(Number(input))) {
        throw Error('Input is not a number')
    }

    return Number(input)
}

export {
    inputIsNumber,
    sanitizeNumber,
}
