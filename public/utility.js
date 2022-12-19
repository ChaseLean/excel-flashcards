function redShade(x) {
    return Math.min(100, x / 10 + 90);
}

function cardOpacity(x) {
    return Math.min(1, 0.25 + x / 200);
}