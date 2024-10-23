import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { Viajes } from '../interfaces/viajes';
import { AuthServiceService } from './auth-service.service';
import { Usuario } from '../interfaces/usuario';
import { Vehiculo } from '../interfaces/vehiculo';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  usuarios: Usuario[] = [];

  constructor(
    private firestore: AngularFirestore,
  ) { }

  recuperarUsuarios(): Observable<any[]> {
    return this.firestore.collection('usuarios').valueChanges();
  }
  obtenerUsuarios() {
    this.recuperarUsuarios().subscribe((usuarios: Usuario[]) => {
      this.usuarios = usuarios; // Almacena los usuarios recuperados en la variable
      console.log('Usuarios recuperados:', this.usuarios); // Para verificar en la consola
    }, error => {
      console.error('Error al recuperar usuarios:', error); // Manejo de errores
    });
  }

  agregarViaje(viaje: any): Promise<void> {
    const viajeId = this.firestore.createId(); 
    return this.firestore.collection('viajes').doc(viajeId).set({ ...viaje, id: viajeId });
  }
  
  recuperarViajes(): Observable<Viajes[]> {
    return this.firestore.collection<Viajes>('viajes').valueChanges();
  }
  eliminarViaje(id: number): Promise<void> {
    return this.firestore.collection('viajes').doc(id.toString()).delete();
  }

  obtenerVehiculoUsuario(usuarioId: string): Observable<Vehiculo | null> {
    console.log(usuarioId)
    console.log("usuarios", this.recuperarUsuarios())
    return this.firestore.collection('usuarios').doc(usuarioId).valueChanges().pipe(
      map((usuario: any) => usuario && usuario.vehiculo ? usuario.vehiculo: null)
    );
  }
  

  
}
