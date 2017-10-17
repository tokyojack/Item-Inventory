exports.isEmpty = function(value) {
    return value.replace(/\s/g, '').length === 0 ? true : false;
}
