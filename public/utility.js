function newEl(args) {
    const type = args.type ?? false;
    const className = args.className ?? false;
    const id = args.id ?? false;
    const textContent = args.textContent ?? false;
    let el;

    if (type) el = document.createElement(`${type}`);
    else {
        console.log("No type parameter provided. Unable to create element.");
        return;
    }
    if (className) el.classList.add(`${className}`);
    if (id) el.id = id;
    if (textContent) el.textContent = textContent;

    return el;
}

function setFontSize(x) {
    return Math.min(30, Math.max(20, -x / 6 + 35));
}

function removeItemFromArray(arr, value) {
    var index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
}