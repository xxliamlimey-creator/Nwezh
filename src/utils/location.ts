import {
  suggestMethodForLocation,
  type CalculationMethodId,
  type PrayerLocation,
} from '../../shared/prayerEngine';
import {findNearestCity} from '../data/cities';

export interface DetectedLocationResult {
  location: PrayerLocation;
  suggestedMethod: CalculationMethodId;
}

export function detectDeviceCoordinates(): Promise<DetectedLocationResult> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      reject(new Error('Location detection is not supported in this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

        const nearest = findNearestCity(lat, lng);
        let name =
          nearest.distanceKm < 60
            ? nearest.city.name
            : `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        let country = nearest.distanceKm < 60 ? nearest.city.country : '';
        let countryCode =
          nearest.distanceKm < 60 ? nearest.city.countryCode : '';

        if (navigator.onLine) {
          try {
            const res = await fetch(
              `/api/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`
            );
            if (res.ok) {
              const data = (await res.json()) as {
                city?: {name: string; country: string; countryCode: string} | null;
              };
              if (data.city?.name) {
                name = data.city.name;
                country = data.city.country || country;
                countryCode = data.city.countryCode || countryCode;
              }
            }
          } catch {
            // Keep offline nearest-city fallback
          }
        }

        resolve({
          location: {
            name,
            country,
            lat,
            lng,
            timezone,
            source: 'auto',
          },
          suggestedMethod: suggestMethodForLocation(lat, lng, countryCode),
        });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              'Location access was denied. Please choose your city manually.'
            )
          );
        } else {
          reject(
            new Error(
              'Could not determine your current location. Please choose a city manually.'
            )
          );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 5 * 60_000,
      }
    );
  });
}
