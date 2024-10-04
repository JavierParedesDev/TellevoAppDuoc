import { Component, OnInit } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { LoadingController } from '@ionic/angular';
import { MapsService } from '../services/maps.service';
import { AuthServiceService } from '../services/auth-service.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  tieneVehiculo: boolean = false;

  vje: Viajes = {
    id: Date.now(),
    destino: "",
    capacidad: 0,
    costo: 0,
    horaSalida: "",
    lat: 0,
    lng: 0
  };
  
  viajes: Viajes[] = [];
  currentLocation: any;
  map: L.Map | undefined;
  marker: L.Marker | null = null;

  constructor(
    private mapsService: MapsService,
    private loadingController: LoadingController,
    private authService: AuthServiceService
  ) {}

  ngOnInit() {
    this.verificarVehiculo();
    this.initCurrentLocation();
  }

  async initCurrentLocation() {
    try {
      this.currentLocation = await this.mapsService.getCurrentLocation();
      this.initMap();
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    }
  }

  initMap() {
    if (this.currentLocation) {
      this.map = this.mapsService.initMap('map', this.currentLocation.lat, this.currentLocation.lng);
    }
  }

  async programarViaje() {
    const loading = await this.loadingController.create({
      message: 'Creando dirección...',
    });
    await loading.present();

    const StorageViajes = localStorage.getItem('viajes');
    let viajes: Viajes[] = StorageViajes ? JSON.parse(StorageViajes) : [];

    this.vje.id = Date.now();

    try {
      const location = await this.mapsService.getLatLngFromAddress(this.vje.destino);
      this.vje.lat = location.lat;
      this.vje.lng = location.lng;

      viajes.unshift(this.vje);
      localStorage.setItem('viajes', JSON.stringify(viajes));
      console.log('Viaje guardado:', this.vje);

      // Refresca la lista de viajes
      this.viajes = viajes; // Actualiza el estado local
      this.mapsService.refreshMaps(this.viajes, this.currentLocation); // Refresca los mapas
    } catch (error) {
      console.error('Error al crear la dirección:', error);
    } finally {
      await loading.dismiss();
    }
  }

  onDestinoChange() {
    if (this.marker) {
      this.map?.removeLayer(this.marker); // Elimina el marcador anterior
    }
  
    if (this.vje.destino) {
      this.mapsService.getLatLngFromAddress(this.vje.destino).then(location => {
        this.vje.lat = location.lat;
        this.vje.lng = location.lng;
  
        // Añadir marcador al mapa
        this.marker = this.mapsService.addMarker(this.map, location.lat, location.lng); // Asigna el marcador a la variable
        this.mapsService.drawRoute(this.map, this.currentLocation.lat, this.currentLocation.lng, location.lat, location.lng);
      }).catch(error => {
        console.error('Error al obtener la ubicación del destino:', error);
      });
    }
  }
  

  verificarVehiculo() {
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        this.authService.getUserVehicle(usuario.uid).subscribe(vehiculo => {
          this.tieneVehiculo = !!vehiculo; 
          if (!this.tieneVehiculo) {
            console.log("El usuario no tiene vehículo habilitado.");
          } else {
            console.log("El usuario tiene vehículo habilitado.");
          }
        });
      }
    });
  }
}
