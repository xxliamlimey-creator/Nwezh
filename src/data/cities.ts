export interface CityEntry {
  name: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  timezone: string;
}

export const WORLD_CITIES: CityEntry[] = [
  // Sacred & Arabian Peninsula
  {name: 'Mecca', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.4225, lng: 39.8262, timezone: 'Asia/Riyadh'},
  {name: 'Medina', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.4672, lng: 39.6112, timezone: 'Asia/Riyadh'},
  {name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', lat: 24.7136, lng: 46.6753, timezone: 'Asia/Riyadh'},
  {name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', lat: 21.5433, lng: 39.1728, timezone: 'Asia/Riyadh'},
  {name: 'Dammam', country: 'Saudi Arabia', countryCode: 'SA', lat: 26.4207, lng: 50.0888, timezone: 'Asia/Riyadh'},
  {name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai'},
  {name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', lat: 24.4539, lng: 54.3773, timezone: 'Asia/Dubai'},
  {name: 'Sharjah', country: 'United Arab Emirates', countryCode: 'AE', lat: 25.3463, lng: 55.4209, timezone: 'Asia/Dubai'},
  {name: 'Doha', country: 'Qatar', countryCode: 'QA', lat: 25.2854, lng: 51.531, timezone: 'Asia/Qatar'},
  {name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', lat: 29.3759, lng: 47.9774, timezone: 'Asia/Kuwait'},
  {name: 'Manama', country: 'Bahrain', countryCode: 'BH', lat: 26.2285, lng: 50.586, timezone: 'Asia/Bahrain'},
  {name: 'Muscat', country: 'Oman', countryCode: 'OM', lat: 23.588, lng: 58.3829, timezone: 'Asia/Muscat'},
  {name: 'Sanaa', country: 'Yemen', countryCode: 'YE', lat: 15.3694, lng: 44.191, timezone: 'Asia/Aden'},

  // Kurdistan, Iraq & Levant
  {name: 'Erbil', country: 'Iraq', countryCode: 'IQ', lat: 36.1911, lng: 44.0092, timezone: 'Asia/Baghdad'},
  {name: 'Sulaymaniyah', country: 'Iraq', countryCode: 'IQ', lat: 35.5613, lng: 45.4304, timezone: 'Asia/Baghdad'},
  {name: 'Duhok', country: 'Iraq', countryCode: 'IQ', lat: 36.8669, lng: 42.9503, timezone: 'Asia/Baghdad'},
  {name: 'Halabja', country: 'Iraq', countryCode: 'IQ', lat: 35.1778, lng: 45.9861, timezone: 'Asia/Baghdad'},
  {name: 'Kirkuk', country: 'Iraq', countryCode: 'IQ', lat: 35.4681, lng: 44.3922, timezone: 'Asia/Baghdad'},
  {name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', lat: 33.3152, lng: 44.3661, timezone: 'Asia/Baghdad'},
  {name: 'Basra', country: 'Iraq', countryCode: 'IQ', lat: 30.5085, lng: 47.7804, timezone: 'Asia/Baghdad'},
  {name: 'Mosul', country: 'Iraq', countryCode: 'IQ', lat: 36.335, lng: 43.1189, timezone: 'Asia/Baghdad'},
  {name: 'Jerusalem', country: 'Palestine', countryCode: 'PS', lat: 31.7683, lng: 35.2137, timezone: 'Asia/Jerusalem'},
  {name: 'Amman', country: 'Jordan', countryCode: 'JO', lat: 31.9454, lng: 35.9284, timezone: 'Asia/Amman'},
  {name: 'Beirut', country: 'Lebanon', countryCode: 'LB', lat: 33.8938, lng: 35.5018, timezone: 'Asia/Beirut'},
  {name: 'Damascus', country: 'Syria', countryCode: 'SY', lat: 33.5138, lng: 36.2765, timezone: 'Asia/Damascus'},

  // Turkey
  {name: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lng: 28.9784, timezone: 'Europe/Istanbul'},
  {name: 'Ankara', country: 'Turkey', countryCode: 'TR', lat: 39.9334, lng: 32.8597, timezone: 'Europe/Istanbul'},
  {name: 'Izmir', country: 'Turkey', countryCode: 'TR', lat: 38.4237, lng: 27.1428, timezone: 'Europe/Istanbul'},
  {name: 'Bursa', country: 'Turkey', countryCode: 'TR', lat: 40.1885, lng: 29.061, timezone: 'Europe/Istanbul'},
  {name: 'Diyarbakir', country: 'Turkey', countryCode: 'TR', lat: 37.9144, lng: 40.2306, timezone: 'Europe/Istanbul'},
  {name: 'Konya', country: 'Turkey', countryCode: 'TR', lat: 37.8746, lng: 32.4932, timezone: 'Europe/Istanbul'},
  {name: 'Gaziantep', country: 'Turkey', countryCode: 'TR', lat: 37.0662, lng: 37.3833, timezone: 'Europe/Istanbul'},

  // Europe & UK
  {name: 'London', country: 'United Kingdom', countryCode: 'GB', lat: 51.5072, lng: -0.1276, timezone: 'Europe/London'},
  {name: 'Birmingham', country: 'United Kingdom', countryCode: 'GB', lat: 52.4862, lng: -1.8904, timezone: 'Europe/London'},
  {name: 'Manchester', country: 'United Kingdom', countryCode: 'GB', lat: 53.4808, lng: -2.2426, timezone: 'Europe/London'},
  {name: 'Bradford', country: 'United Kingdom', countryCode: 'GB', lat: 53.796, lng: -1.7594, timezone: 'Europe/London'},
  {name: 'Edinburgh', country: 'United Kingdom', countryCode: 'GB', lat: 55.9533, lng: -3.1883, timezone: 'Europe/London'},
  {name: 'Dublin', country: 'Ireland', countryCode: 'IE', lat: 53.3498, lng: -6.2603, timezone: 'Europe/Dublin'},
  {name: 'Paris', country: 'France', countryCode: 'FR', lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris'},
  {name: 'Lyon', country: 'France', countryCode: 'FR', lat: 45.764, lng: 4.8357, timezone: 'Europe/Paris'},
  {name: 'Marseille', country: 'France', countryCode: 'FR', lat: 43.2965, lng: 5.3698, timezone: 'Europe/Paris'},
  {name: 'Berlin', country: 'Germany', countryCode: 'DE', lat: 52.52, lng: 13.405, timezone: 'Europe/Berlin'},
  {name: 'Munich', country: 'Germany', countryCode: 'DE', lat: 48.1351, lng: 11.582, timezone: 'Europe/Berlin'},
  {name: 'Frankfurt', country: 'Germany', countryCode: 'DE', lat: 50.1109, lng: 8.6821, timezone: 'Europe/Berlin'},
  {name: 'Cologne', country: 'Germany', countryCode: 'DE', lat: 50.9375, lng: 6.9603, timezone: 'Europe/Berlin'},
  {name: 'Hamburg', country: 'Germany', countryCode: 'DE', lat: 53.5511, lng: 9.9937, timezone: 'Europe/Berlin'},
  {name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.3676, lng: 4.9041, timezone: 'Europe/Amsterdam'},
  {name: 'Rotterdam', country: 'Netherlands', countryCode: 'NL', lat: 51.9244, lng: 4.4777, timezone: 'Europe/Amsterdam'},
  {name: 'Brussels', country: 'Belgium', countryCode: 'BE', lat: 50.8503, lng: 4.3517, timezone: 'Europe/Brussels'},
  {name: 'Zurich', country: 'Switzerland', countryCode: 'CH', lat: 47.3769, lng: 8.5417, timezone: 'Europe/Zurich'},
  {name: 'Geneva', country: 'Switzerland', countryCode: 'CH', lat: 46.2044, lng: 6.1432, timezone: 'Europe/Zurich'},
  {name: 'Vienna', country: 'Austria', countryCode: 'AT', lat: 48.2082, lng: 16.3738, timezone: 'Europe/Vienna'},
  {name: 'Stockholm', country: 'Sweden', countryCode: 'SE', lat: 59.3293, lng: 18.0686, timezone: 'Europe/Stockholm'},
  {name: 'Malmo', country: 'Sweden', countryCode: 'SE', lat: 55.605, lng: 13.0038, timezone: 'Europe/Stockholm'},
  {name: 'Oslo', country: 'Norway', countryCode: 'NO', lat: 59.9139, lng: 10.7522, timezone: 'Europe/Oslo'},
  {name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', lat: 55.6761, lng: 12.5683, timezone: 'Europe/Copenhagen'},
  {name: 'Helsinki', country: 'Finland', countryCode: 'FI', lat: 60.1699, lng: 24.9384, timezone: 'Europe/Helsinki'},
  {name: 'Madrid', country: 'Spain', countryCode: 'ES', lat: 40.4168, lng: -3.7038, timezone: 'Europe/Madrid'},
  {name: 'Barcelona', country: 'Spain', countryCode: 'ES', lat: 41.3874, lng: 2.1686, timezone: 'Europe/Madrid'},
  {name: 'Rome', country: 'Italy', countryCode: 'IT', lat: 41.9028, lng: 12.4964, timezone: 'Europe/Rome'},
  {name: 'Milan', country: 'Italy', countryCode: 'IT', lat: 45.4642, lng: 9.19, timezone: 'Europe/Rome'},
  {name: 'Sarajevo', country: 'Bosnia & Herzegovina', countryCode: 'BA', lat: 43.8563, lng: 18.4131, timezone: 'Europe/Sarajevo'},
  {name: 'Tirana', country: 'Albania', countryCode: 'AL', lat: 41.3275, lng: 19.8187, timezone: 'Europe/Tirane'},
  {name: 'Pristina', country: 'Kosovo', countryCode: 'XK', lat: 42.6629, lng: 21.1655, timezone: 'Europe/Belgrade'},
  {name: 'Athens', country: 'Greece', countryCode: 'GR', lat: 37.9838, lng: 23.7275, timezone: 'Europe/Athens'},

  // North America
  {name: 'New York', country: 'United States', countryCode: 'US', lat: 40.7128, lng: -74.006, timezone: 'America/New_York'},
  {name: 'Chicago', country: 'United States', countryCode: 'US', lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago'},
  {name: 'Los Angeles', country: 'United States', countryCode: 'US', lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles'},
  {name: 'Houston', country: 'United States', countryCode: 'US', lat: 29.7604, lng: -95.3698, timezone: 'America/Chicago'},
  {name: 'Dallas', country: 'United States', countryCode: 'US', lat: 32.7767, lng: -96.797, timezone: 'America/Chicago'},
  {name: 'Detroit', country: 'United States', countryCode: 'US', lat: 42.3314, lng: -83.0458, timezone: 'America/Detroit'},
  {name: 'Dearborn', country: 'United States', countryCode: 'US', lat: 42.3223, lng: -83.1763, timezone: 'America/Detroit'},
  {name: 'Washington, D.C.', country: 'United States', countryCode: 'US', lat: 38.9072, lng: -77.0369, timezone: 'America/New_York'},
  {name: 'Philadelphia', country: 'United States', countryCode: 'US', lat: 39.9526, lng: -75.1652, timezone: 'America/New_York'},
  {name: 'Boston', country: 'United States', countryCode: 'US', lat: 42.3601, lng: -71.0589, timezone: 'America/New_York'},
  {name: 'Atlanta', country: 'United States', countryCode: 'US', lat: 33.749, lng: -84.388, timezone: 'America/New_York'},
  {name: 'Miami', country: 'United States', countryCode: 'US', lat: 25.7617, lng: -80.1918, timezone: 'America/New_York'},
  {name: 'San Francisco', country: 'United States', countryCode: 'US', lat: 37.7749, lng: -122.4194, timezone: 'America/Los_Angeles'},
  {name: 'San Jose', country: 'United States', countryCode: 'US', lat: 37.3382, lng: -121.8863, timezone: 'America/Los_Angeles'},
  {name: 'Seattle', country: 'United States', countryCode: 'US', lat: 47.6062, lng: -122.3321, timezone: 'America/Los_Angeles'},
  {name: 'Minneapolis', country: 'United States', countryCode: 'US', lat: 44.9778, lng: -93.265, timezone: 'America/Chicago'},
  {name: 'Phoenix', country: 'United States', countryCode: 'US', lat: 33.4484, lng: -112.074, timezone: 'America/Phoenix'},
  {name: 'Toronto', country: 'Canada', countryCode: 'CA', lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto'},
  {name: 'Montreal', country: 'Canada', countryCode: 'CA', lat: 45.5017, lng: -73.5673, timezone: 'America/Toronto'},
  {name: 'Ottawa', country: 'Canada', countryCode: 'CA', lat: 45.4215, lng: -75.6972, timezone: 'America/Toronto'},
  {name: 'Vancouver', country: 'Canada', countryCode: 'CA', lat: 49.2827, lng: -123.1207, timezone: 'America/Vancouver'},
  {name: 'Calgary', country: 'Canada', countryCode: 'CA', lat: 51.0447, lng: -114.0719, timezone: 'America/Edmonton'},
  {name: 'Edmonton', country: 'Canada', countryCode: 'CA', lat: 53.5461, lng: -113.4938, timezone: 'America/Edmonton'},

  // Africa
  {name: 'Cairo', country: 'Egypt', countryCode: 'EG', lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo'},
  {name: 'Alexandria', country: 'Egypt', countryCode: 'EG', lat: 31.2001, lng: 29.9187, timezone: 'Africa/Cairo'},
  {name: 'Casablanca', country: 'Morocco', countryCode: 'MA', lat: 33.5731, lng: -7.5898, timezone: 'Africa/Casablanca'},
  {name: 'Rabat', country: 'Morocco', countryCode: 'MA', lat: 34.0209, lng: -6.8416, timezone: 'Africa/Casablanca'},
  {name: 'Marrakech', country: 'Morocco', countryCode: 'MA', lat: 31.6295, lng: -7.9811, timezone: 'Africa/Casablanca'},
  {name: 'Algiers', country: 'Algeria', countryCode: 'DZ', lat: 36.7538, lng: 3.0588, timezone: 'Africa/Algiers'},
  {name: 'Tunis', country: 'Tunisia', countryCode: 'TN', lat: 36.8065, lng: 10.1815, timezone: 'Africa/Tunis'},
  {name: 'Tripoli', country: 'Libya', countryCode: 'LY', lat: 32.8872, lng: 13.1913, timezone: 'Africa/Tripoli'},
  {name: 'Khartoum', country: 'Sudan', countryCode: 'SD', lat: 15.5007, lng: 32.5599, timezone: 'Africa/Khartoum'},
  {name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.5244, lng: 3.3792, timezone: 'Africa/Lagos'},
  {name: 'Abuja', country: 'Nigeria', countryCode: 'NG', lat: 9.0765, lng: 7.3986, timezone: 'Africa/Lagos'},
  {name: 'Dakar', country: 'Senegal', countryCode: 'SN', lat: 14.7167, lng: -17.4677, timezone: 'Africa/Dakar'},
  {name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.2921, lng: 36.8219, timezone: 'Africa/Nairobi'},
  {name: 'Mogadishu', country: 'Somalia', countryCode: 'SO', lat: 2.0469, lng: 45.3182, timezone: 'Africa/Mogadishu'},
  {name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', lat: -33.9249, lng: 18.4241, timezone: 'Africa/Johannesburg'},
  {name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg'},

  // South & Southeast Asia
  {name: 'Karachi', country: 'Pakistan', countryCode: 'PK', lat: 24.8607, lng: 67.0011, timezone: 'Asia/Karachi'},
  {name: 'Lahore', country: 'Pakistan', countryCode: 'PK', lat: 31.5204, lng: 74.3587, timezone: 'Asia/Karachi'},
  {name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', lat: 33.6844, lng: 73.0479, timezone: 'Asia/Karachi'},
  {name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.8103, lng: 90.4125, timezone: 'Asia/Dhaka'},
  {name: 'Chittagong', country: 'Bangladesh', countryCode: 'BD', lat: 22.3569, lng: 91.7832, timezone: 'Asia/Dhaka'},
  {name: 'New Delhi', country: 'India', countryCode: 'IN', lat: 28.6139, lng: 77.209, timezone: 'Asia/Kolkata'},
  {name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.076, lng: 72.8777, timezone: 'Asia/Kolkata'},
  {name: 'Hyderabad', country: 'India', countryCode: 'IN', lat: 17.385, lng: 78.4867, timezone: 'Asia/Kolkata'},
  {name: 'Bengaluru', country: 'India', countryCode: 'IN', lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata'},
  {name: 'Lucknow', country: 'India', countryCode: 'IN', lat: 26.8467, lng: 80.9462, timezone: 'Asia/Kolkata'},
  {name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', lat: -6.2088, lng: 106.8456, timezone: 'Asia/Jakarta'},
  {name: 'Surabaya', country: 'Indonesia', countryCode: 'ID', lat: -7.2575, lng: 112.7521, timezone: 'Asia/Jakarta'},
  {name: 'Bandung', country: 'Indonesia', countryCode: 'ID', lat: -6.9175, lng: 107.6191, timezone: 'Asia/Jakarta'},
  {name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', lat: 3.139, lng: 101.6869, timezone: 'Asia/Kuala_Lumpur'},
  {name: 'George Town', country: 'Malaysia', countryCode: 'MY', lat: 5.4141, lng: 100.3288, timezone: 'Asia/Kuala_Lumpur'},
  {name: 'Singapore', country: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore'},
  {name: 'Bandar Seri Begawan', country: 'Brunei', countryCode: 'BN', lat: 4.9031, lng: 114.9398, timezone: 'Asia/Brunei'},

  // Iran, Central Asia, East Asia & Oceania
  {name: 'Tehran', country: 'Iran', countryCode: 'IR', lat: 35.6892, lng: 51.389, timezone: 'Asia/Tehran'},
  {name: 'Sanandaj', country: 'Iran', countryCode: 'IR', lat: 35.3219, lng: 46.9862, timezone: 'Asia/Tehran'},
  {name: 'Kermanshah', country: 'Iran', countryCode: 'IR', lat: 34.3142, lng: 47.065, timezone: 'Asia/Tehran'},
  {name: 'Baku', country: 'Azerbaijan', countryCode: 'AZ', lat: 40.4093, lng: 49.8671, timezone: 'Asia/Baku'},
  {name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', lat: 41.2995, lng: 69.2401, timezone: 'Asia/Tashkent'},
  {name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', lat: 43.222, lng: 76.8512, timezone: 'Asia/Almaty'},
  {name: 'Moscow', country: 'Russia', countryCode: 'RU', lat: 55.7558, lng: 37.6173, timezone: 'Europe/Moscow'},
  {name: 'Kazan', country: 'Russia', countryCode: 'RU', lat: 55.7961, lng: 49.1064, timezone: 'Europe/Moscow'},
  {name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo'},
  {name: 'Seoul', country: 'South Korea', countryCode: 'KR', lat: 37.5665, lng: 126.978, timezone: 'Asia/Seoul'},
  {name: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney'},
  {name: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.8136, lng: 144.9631, timezone: 'Australia/Melbourne'},
  {name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', lat: -36.8485, lng: 174.7633, timezone: 'Pacific/Auckland'},
];

export function findNearestCity(lat: number, lng: number): {city: CityEntry; distanceKm: number} {
  let best = WORLD_CITIES[0];
  let bestDist = Infinity;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  for (const c of WORLD_CITIES) {
    const dLat = toRad(c.lat - lat);
    const dLng = toRad(c.lng - lng);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(c.lat)) * Math.sin(dLng / 2) ** 2;
    const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distKm < bestDist) {
      bestDist = distKm;
      best = c;
    }
  }
  return {city: best, distanceKm: bestDist};
}
