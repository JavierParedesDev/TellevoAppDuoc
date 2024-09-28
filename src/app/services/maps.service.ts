import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root',
})
export class MapsService {
  private apiKey = '5b3ce3597851110001cf62481b2e99cd208841a7b5472176e8ae01d3'; // OpenRouteService API key || Podría dejarlo en un .env también pero es innecesario para este caso
  maps: { [key: string]: any } = {};

  constructor(private http: HttpClient) {}

  // Obtener coordenadas a partir de una dirección
  getLatLngFromAddress(address: string): Promise<any> {
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${this.apiKey}&text=${encodeURIComponent(address)}`;
    return this.http.get(url).toPromise().then((response: any) => {
      if (response.features && response.features.length > 0) {
        const location = response.features[0].geometry.coordinates;
        return {
          lat: location[1],
          lng: location[0],
        };
      } else {
        return { lat: 0, lng: 0 }; // Devuelve valores predeterminados si no se encuentra nada
      }
    });
  }

  // Obtener la ubicación actual usando Geolocation
  async getCurrentLocation(): Promise<any> {
    const coordinates = await Geolocation.getCurrentPosition();
    return {
      lat: coordinates.coords.latitude,
      lng: coordinates.coords.longitude,
    };
  }

  // Inicializar el mapa
  initMap(mapId: string, lat: number, lng: number): any {
    const map = L.map(mapId, {
      zoomControl: false, // Deshabilitar el control de zoom
      doubleClickZoom: false, // Deshabilitar zoom con doble clic
      boxZoom: false, // Deshabilitar zoom de caja
      keyboard: false, // Deshabilitar controles de teclado
      touchZoom: false, // Deshabilitar zoom táctil
    }).setView([lat, lng], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'mapa',
    }).addTo(map);

    return map;
  }

  // Agregar marcador en el mapa
  addMarker(map: any, lat: number, lng: number): void {
    L.marker([lat, lng]).addTo(map);
  }

  // Dibujar ruta en el mapa
  drawRoute(map: any, startLat: number, startLng: number, endLat: number, endLng: number): Promise<void> {
    const routingUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${this.apiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`;
    return this.http.get(routingUrl).toPromise().then((response: any) => {
      const coordinates = response.features[0].geometry.coordinates;
      const routeCoordinates = coordinates.map((coord: any) => [coord[1], coord[0]]); // Invertir lat/lng para Leaflet

      const routeLine = L.polyline(routeCoordinates, { color: 'blue', weight: 4 }).addTo(map);

      const bounds = L.latLngBounds([
        [startLat, startLng],
        [endLat, endLng],
      ]);
      map.fitBounds(bounds);
    });
  }

  destroyMap(mapId: string): void {
    const map = this.maps[mapId];
    if (map) {
      map.remove(); // Elimina el mapa del DOM y su memoria
      delete this.maps[mapId]; // Elimina el registro del mapa en la lista de mapas
    }
  }

  // Destruir todos los mapas
  destroyAllMaps(): void {
    Object.keys(this.maps).forEach((mapId) => {
      this.destroyMap(mapId);
    });
  }

  // Refrescar los mapas (destruir y volver a crear)
  refreshMaps(viajes: any[], currentLocation: any): void {
    this.destroyAllMaps(); // Destruye todos los mapas activos

    setTimeout(() => {
      viajes.forEach((viaje) => {
        if (viaje.lat !== undefined && viaje.lng !== undefined) {
          const mapId = `map-${viaje.id}`;

          const mapContainer = document.getElementById(mapId);
          if (mapContainer) {
            const map = this.initMap(mapId, viaje.lat, viaje.lng);
            this.addMarker(map, viaje.lat, viaje.lng);

            if (currentLocation) {
              this.addMarker(map, currentLocation.lat, currentLocation.lng);
              this.drawRoute(map, currentLocation.lat, currentLocation.lng, viaje.lat, viaje.lng);
            }
          }
        }
      });
    }, 300); // Agrega un pequeño retraso para asegurarse de que el DOM esté listo
  }

}
