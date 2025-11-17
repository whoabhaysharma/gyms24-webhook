/**
 * Generates a unique access code.
 * @returns {string} The generated access code.
 */
function generateAccessCode() {
    return "GYM-" + Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = {
    generateAccessCode
};
