function inputValid(input) {
    return !Number.isNaN(Number(input));
}

function sanitizeInput(input) {
    if (Number.isNaN(Number(input))) {
        throw Error('Input is not a number')
    }

    return Number(input)
}

export {
    inputValid,
    sanitizeInput,
}
