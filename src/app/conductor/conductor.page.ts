import { Component, OnInit } from '@angular/core';
import { Viajes } from '../interfaces/viajes';
import { AlertController, BooleanValueAccessor, LoadingController } from '@ionic/angular';
import { MapsService } from '../services/maps.service';
import { AuthServiceService } from '../services/auth-service.service';
import * as L from 'leaflet';
import { DatabaseService } from '../services/database.service';
import { Usuario } from '../interfaces/usuario';
import { flush } from '@angular/core/testing';

@Component({
  selector: 'app-conductor',
  templateUrl: './conductor.page.html',
  styleUrls: ['./conductor.page.scss'],
})
export class ConductorPage implements OnInit {
  tieneVehiculo: boolean = false;
  userId: string | null = null;
  usuarioId: string | null = null;


  vje: Viajes = {
    id: Date.now(),
    destino: "",
    capacidad: 0,
    costo: 0,
    horaSalida: "",
    lat: 0,
    lng: 0,
    usuarioId: ''
  };
  
  viajes: Viajes[] = [];
  currentLocation: any;
  map: L.Map | undefined;
  marker: L.Marker | null = null;

  constructor(
    private mapsService: MapsService,
    private loadingController: LoadingController,
    private authService: AuthServiceService,
    private databaseService: DatabaseService,
    private alertCtrl : AlertController
  ) {}

  ngOnInit() {
    this.verificarVehiculo();
    this.initCurrentLocation();
    this.obtenerUsuarioId(); 
    console.log(this.databaseService.obtenerUsuarios(), "aqui")
  }

  async initCurrentLocation() {
    try {
      this.currentLocation = await this.mapsService.getCurrentLocation();
      this.initMap();
    } catch (error) {
      console.error('Error al obtener la ubicación actual:', error);
    }
  }
  obtenerUsuarioId() {
    this.authService.getUser().subscribe(usuario => {
      if (usuario) {
        this.usuarioId = usuario.uid; // Almacena el ID del usuario
        console.log('ID del usuario:', this.usuarioId);
      } else {
        console.log('No hay usuario autenticado');
      }
    });
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
    if (this.usuarioId) {
      this.vje.usuarioId = this.usuarioId; // Agrega el ID del usuario al viaje
    } else {
      console.error('El ID del usuario es null. No se puede crear el viaje.');
      await loading.dismiss(); // Cierra el loading si no hay usuario
      return; // Termina el método si no hay usuario
    }

    const StorageViajes = localStorage.getItem('viajes');
    let viajes: Viajes[] = StorageViajes ? JSON.parse(StorageViajes) : [];

    this.vje.id = Date.now();

    try {
      const location = await this.mapsService.getLatLngFromAddress(this.vje.destino);
      this.vje.lat = location.lat;
      this.vje.lng = location.lng;

      // Guardar el viaje en Firestore
      await this.databaseService.agregarViaje(this.vje);
      console.log('Viaje guardado en Firestore:', this.vje);

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
        const usuarioId = usuario.uid; // ID del usuario autenticado
  
        // Recupera la lista de usuarios
        this.databaseService.recuperarUsuarios().subscribe((usuarios: Usuario[]) => {
          // Filtra para encontrar el usuario actual
          const usuarioActual = usuarios.find(u => u.idUser === usuarioId);
  
          if (usuarioActual) {
            // Verifica si el usuario tiene vehículo
            if (usuarioActual.vehiculo) {
              console.log('El usuario tiene vehículo habilitado:', usuarioActual.vehiculo);
              this.tieneVehiculo = true;
            } else {
              console.log('El usuario no tiene vehículo habilitado.');
              this.tieneVehiculo = false;
            }
          } else {
            console.log('No se encontró el usuario actual.');
            this.tieneVehiculo = false; // Asumimos que no tiene vehículo si no se encuentra
          }
        }, error => {
          console.error('Error al recuperar usuarios:', error);
        });
      } else {
        console.log('No hay usuario autenticado');
      }
    });
  }
  
  
  
  

  
}

