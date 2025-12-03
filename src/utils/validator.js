/**
 * Validate phone number (10 digits)
 * @param {string} phone
 * @returns {boolean}
 */
const isValidPhone = (phone) => {
    return /^\d{10}$/.test(phone);
};

/**
 * Sanitize phone number (remove non-digits)
 * @param {string} phone
 * @returns {string}
 */
const sanitizePhone = (phone) => {
    return phone.replace(/\D/g, '');
};

module.exports = {
    isValidPhone,
    sanitizePhone
};
