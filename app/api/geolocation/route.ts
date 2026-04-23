import { NextRequest, NextResponse } from 'next/server';

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

export async function GET(request: NextRequest) {
  try {
    // Check for development override parameter
    const url = new URL(request.url);
    const devCountryCode = url.searchParams.get('dev-country');
    
    if (devCountryCode && devCountryCode.length === 2) {
      const currency = countryToCurrency[devCountryCode.toUpperCase()] || countryToCurrency['XX'];
      console.log(`Using development country override: ${devCountryCode}`);
      return NextResponse.json({
        countryCode: devCountryCode.toUpperCase(),
        countryName: devCountryCode.toUpperCase(),
        currency,
        isDevelopment: true,
      });
    }

    // Get client IP from headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    let clientIP = forwardedFor ? forwardedFor.split(',')[0].trim() : '';

    // Validate IP - skip localhost/empty IPs
    if (!clientIP || clientIP === '127.0.0.1' || clientIP === '::1' || clientIP.startsWith('192.168.') || clientIP.startsWith('10.')) {
      console.warn(`Localhost/private IP detected (${clientIP}), attempting fallback geolocation`);
      // Try to get public IP from ipify API instead
      try {
        const ipifyResponse = await fetch('https://api.ipify.org?format=json', { 
          signal: AbortSignal.timeout(3000) 
        });
        if (ipifyResponse.ok) {
          const ipifyData = await ipifyResponse.json();
          clientIP = ipifyData.ip;
        }
      } catch (ipifyError) {
        console.warn('Ipify fallback failed, using default currency');
      }
    }

    // Skip external API if still localhost
    if (clientIP === '127.0.0.1' || clientIP === '::1' || !clientIP) {
      console.log('Using default currency for localhost');
      return NextResponse.json({
        countryCode: 'US',
        countryName: 'United States',
        currency: countryToCurrency['US'],
        isDefault: true,
      });
    }

    // Fetch geolocation data from ipapi.co with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(`https://ipapi.co/${clientIP}/json/`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Geolocation API returned ${response.status}`);
    }

    const data = await response.json();

    const countryCode = data.country_code || 'US';
    const countryName = data.country_name || 'United States';
    const currency = countryToCurrency[countryCode] || countryToCurrency['XX'];

    return NextResponse.json({
      countryCode,
      countryName,
      currency,
      isDefault: false,
    });
  } catch (error) {
    console.error('Failed to detect location:', error);
    // Return default USD fallback
    return NextResponse.json({
      countryCode: 'US',
      countryName: 'United States',
      currency: countryToCurrency['US'],
      isDefault: true,
    });
  }
}
