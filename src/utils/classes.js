function elHasClass(el, classNameToCheck) {
    if (el && el.className) {
        const elClasses = el.className.split(' ');
        return elClasses.some(className => className === classNameToCheck)
    }
    return false
}

function elChildOfClass(el, classNameToCheck) {
    if (el && el.parentNode) {
        if (elHasClass(el.parentNode, classNameToCheck)) {
            return true
        }
        return elChildOfClass(el.parentNode, classNameToCheck);
    }
    return false
}

export {
    elHasClass,
    elChildOfClass,
};
