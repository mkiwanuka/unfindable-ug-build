// Uganda Locale Configuration

export const LOCALE_CONFIG = {
  currency: 'UGX',
  currencySymbol: 'UGX',
  locale: 'en-UG',
  country: 'Uganda',
  countryCode: 'UG',
};

export const UGANDAN_CITIES = [
  'Kampala',
  'Entebbe',
  'Jinja',
  'Mbarara',
  'Gulu',
  'Mbale',
  'Fort Portal',
  'Lira',
  'Soroti',
  'Arua',
  'Masaka',
  'Hoima',
  'Tororo',
  'Kabale',
  'Kasese',
  'Mukono',
  'Wakiso',
  'Iganga',
  'Mityana',
  'Busia',
];

export const UGANDAN_DISTRICTS = [
  'Kampala District',
  'Wakiso District',
  'Mukono District',
  'Jinja District',
  'Mbarara District',
  'Gulu District',
  'Mbale District',
  'Lira District',
  'Soroti District',
  'Arua District',
];

/**
 * Format a number as Ugandan Shillings (UGX)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return `UGX ${amount.toLocaleString('en-UG')}`;
};

/**
 * Format currency for display in compact form
 * @param amount - The amount to format
 * @returns Compact formatted currency string
 */
export const formatCurrencyCompact = (amount: number): string => {
  if (amount >= 1000000) {
    return `UGX ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `UGX ${(amount / 1000).toFixed(0)}K`;
  }
  return `UGX ${amount.toLocaleString('en-UG')}`;
};
