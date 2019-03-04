import { Point } from 'src/models/point';

export const environment = {
  production: true,
  baseURL: '/observatory/api',
  geocodeURL: 'https://www.mapquestapi.com/geocoding/v1/address',
  revGeocodeURL: 'https://www.mapquestapi.com/geocoding/v1/reverse',
  geocodeKey: 'TlOzDikpKPLO5jhzFburuxsvWNH1GNPi',
  mapZoomed: 17,
  mapDefaultZoom: 7,
  mapDefaultPosition: new Point(23, 38)
};