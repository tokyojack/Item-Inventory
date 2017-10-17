//I would like to overload the functions, but Javascript doesn't support it :(.

exports.isUnknownError = function(req, res, redirectLocation, err) {
    if (err) {
        flashMessage(req, res, 'error', redirectLocation, 'There was an unknown error!');
        return true;
    }
    return false;
}

exports.isDatabaseError = function(req, res, redirectLocation, err) {
    if (err) {
        flashMessage(req, res, 'error', redirectLocation, 'There was an error with the database!');
        return true;
    }
    return false;
}

exports.successMessage = function(req, res, redirectLocation, message) {
    flashMessage(req, res, 'success', redirectLocation, message);
    return true;
}

exports.errorMessage = function(req, res, redirectLocation, message) {
    flashMessage(req, res, 'error', redirectLocation, message);
    return true;
}

function flashMessage(req, res, flashType, redirectLocation, message) {
    req.flash(flashType, message);
    
    if (!(redirectLocation === null || redirectLocation === undefined || redirectLocation === ''))
        res.redirect(redirectLocation);
}
