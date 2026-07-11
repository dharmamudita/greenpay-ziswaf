/**
 * Utility to format currency based on selected language.
 * Default exchange rate for demo purposes: 1 USD = Rp 15,000
 */

export const formatCurrency = (amount, languageCode = 'id') => {
  const numAmount = Number(amount) || 0;

  if (languageCode === 'en') {
    const usdAmount = numAmount / 15000;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdAmount);
  }

  // Default IDR
  return 'Rp ' + numAmount.toLocaleString('id-ID');
};
