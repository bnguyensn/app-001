// @flow

function isObject(val) {
    return val !== null && typeof val === 'object' && !Array.isArray(val)
}

export function arrayEqual<T>(arr1: T[], arr2: T[]): boolean {
    // console.log(`Comparing arr1: ${arr1.toString()} and arr2: ${arr2.toString()}`);

    if (arr1.length !== arr2.length) {
        return false
    }

    return arr1.every((val, index) => {
        if (arr2[index]) {
            return val === arr2[index]
        }

        return false
    })
}

export function objEqual(obj1: {}, obj2: {}): boolean {
    // console.log(`Comparing obj1: ${JSON.stringify(obj1)} and obj2: ${JSON.stringify(obj2)}`);

    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
        return false
    }

    return obj1Keys.every((key) => {
        if (isObject(obj1[key])) {
            return objEqual(obj1[key], obj2[key]);
        }

        if (Array.isArray(obj1[key])) {
            return arrayEqual(obj1[key], obj2[key])
        }

        return obj1[key] === obj2[key]
    });
}
