import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { Usuario } from '../interfaces/usuario';
import { Vehiculo } from '../interfaces/vehiculo';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {
   
  }
  login(email: string, contrasena: string) {
    return this.afAuth.signInWithEmailAndPassword(email, contrasena)
      .then((result) => {
        console.log('Usuario logueado:', result.user);

        // Redirigir al usuario después del login exitoso
        this.router.navigate(['/tabs/home']);

        return result.user;
      })
      .catch((error) => {
        console.error('Error al iniciar sesión:', error);
        throw error; // Propaga el error para que sea manejado en el componente
      });
  }

 
  getUser() {
    return this.afAuth.authState;
  }


  
  logout() {
    return this.afAuth.signOut();
  }
  
  
}
