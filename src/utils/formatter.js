/**
 * Format currency
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

module.exports = {
    formatCurrency
};
