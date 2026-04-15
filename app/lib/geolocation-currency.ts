/**
 * Geolocation and Currency Detection Service
 * 
 * Auto-detects user location from IP and returns appropriate currency
 * No UI selection needed - fully automatic
 */

// Currency mapping by country code
const countryToCurrency: Record<string, { code: string; symbol: string; name: string }> = {
  // Asia
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  
  // Europe
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  NL: { code: 'EUR', symbol: '€', name: 'Euro' },
  BE: { code: 'EUR', symbol: '€', name: 'Euro' },
  AT: { code: 'EUR', symbol: '€', name: 'Euro' },
  GR: { code: 'EUR', symbol: '€', name: 'Euro' },
  PT: { code: 'EUR', symbol: '€', name: 'Euro' },
  IE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FI: { code: 'EUR', symbol: '€', name: 'Euro' },
  LU: { code: 'EUR', symbol: '€', name: 'Euro' },
  CY: { code: 'EUR', symbol: '€', name: 'Euro' },
  MT: { code: 'EUR', symbol: '€', name: 'Euro' },
  SK: { code: 'EUR', symbol: '€', name: 'Euro' },
  SI: { code: 'EUR', symbol: '€', name: 'Euro' },
  
  // Asia-Pacific
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  TW: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  
  // Middle East & South Asia
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Arabian Riyal' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  QA: { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal' },
  BH: { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar' },
  KW: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  OM: { code: 'OMR', symbol: '﷼', name: 'Omani Rial' },
  PK: { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  BD: { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  LK: { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
  
  // Americas
  MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CL: { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
  CO: { code: 'COP', symbol: '$', name: 'Colombian Peso' },
  PE: { code: 'PEN', symbol: 'S/', name: 'Peruvian Sol' },
  
  // Africa
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  EG: { code: 'EGP', symbol: '£', name: 'Egyptian Pound' },
  NG: { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  KE: { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  
  // Default
  XX: { code: 'USD', symbol: '$', name: 'US Dollar' }, // Fallback
};

export interface UserLocation {
  countryCode: string;
  countryName: string;
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
}

/**
 * Detect user's location and currency from IP
 * Calls server-side API to avoid CORS issues
 */
export async function detectUserLocation(): Promise<UserLocation> {
  try {
    const response = await fetch('/api/geolocation', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to detect location, using default USD:', error);
    return {
      countryCode: 'US',
      countryName: 'United States',
      currency: countryToCurrency['US'],
    };
  }
}

/**
 * Format number with appropriate locale and currency
 */
export function formatCurrency(amount: number, currencyCode: string): string {
  try {
    const localeMap: Record<string, string> = {
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
      INR: 'en-IN',
      JPY: 'ja-JP',
      CNY: 'zh-CN',
      AUD: 'en-AU',
      CAD: 'en-CA',
      MXN: 'es-MX',
      BRL: 'pt-BR',
      SGD: 'en-SG',
      HKD: 'en-HK',
      ZAR: 'en-ZA',
      KRW: 'ko-KR',
      THB: 'th-TH',
      PHP: 'en-PH',
      IDR: 'id-ID',
      VND: 'vi-VN',
      PKR: 'en-PK',
      BDT: 'bn-BD',
      LKR: 'si-LK',
    };

    const locale = localeMap[currencyCode] || 'en-US';

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    return `${countryToCurrency[currencyCode]?.symbol || '$'} ${amount.toLocaleString()}`;
  }
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  // Find the currency by code
  for (const currency of Object.values(countryToCurrency)) {
    if (currency.code === currencyCode) {
      return currency.symbol;
    }
  }
  return '$'; // Default fallback
}

/**
 * Get all available currencies (for reference/debug)
 */
export function getAllCurrencies(): Record<string, any> {
  const uniqueCurrencies: Record<string, any> = {};
  
  Object.values(countryToCurrency).forEach(currency => {
    if (!uniqueCurrencies[currency.code]) {
      uniqueCurrencies[currency.code] = currency;
    }
  });
  
  return uniqueCurrencies;
}
