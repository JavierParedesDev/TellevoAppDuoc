import { Component, OnInit } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { AlertController } from '@ionic/angular';
import { Vehiculo } from '../interfaces/vehiculo';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Asegúrate de importar esto

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  usr: Usuario = {
    id: Date.now(),
    nombre: "",
    email: "",
    contrasena: ""
  };

  vcl: Vehiculo = {
    id: Date.now(),
    marca: "",
    modelo: "",
    date: 1994
  };
  
  tieneVehiculo: boolean = false;

  constructor(
    private alert: AlertController,
    private firestore: AngularFirestore,
    private router: Router,
    private auth: AngularFireAuth 
  ) { }

  ngOnInit() { }

  async registro() {
    // Validación de campos de usuario
    if (!this.usr.nombre || !this.usr.email || !this.usr.contrasena) {
      await this.alertas("Error!! Rellene los campos de usuario");
      return;
    }

    // Validación de campos de vehículo si tiene uno
    if (this.tieneVehiculo) {
      if (!this.vcl.marca || !this.vcl.modelo || !this.vcl.date) {
        await this.alertas("Error!! Rellene los campos del vehículo");
        return;
      }
    }

    try {
      // Registra al usuario en la base de datos
      const cred = await this.auth.createUserWithEmailAndPassword(this.usr.email, this.usr.contrasena);
      const userId = cred.user?.uid; 

     
      const usuarioRegistro: any = {
        idUser: userId, 
        nombre: this.usr.nombre,
        email: this.usr.email,
        vehiculo: this.tieneVehiculo ? {
          idVehiculo: this.vcl.id,
          marca: this.vcl.marca,
          modelo: this.vcl.modelo,
          año: this.vcl.date
        } : null
      };

    
      await this.registrarUsuario(usuarioRegistro);

      
      await this.alertas("Usuario registrado con éxito");
      this.router.navigateByUrl("/login");

     
      this.resetearCampos();
    } catch (error) {
      await this.alertas("Error al registrar el usuario: " );
    }
  }

  async alertas(mensaje: string) {
    const alert = await this.alert.create({
      header: mensaje,
      buttons: ["Aceptar"]
    });
    await alert.present();
  }

  async registrarUsuario(usuario: any) {
    
    return this.firestore.collection('usuarios').add(usuario);
  }

  resetearCampos() {
    this.usr = {
      id: Date.now(),
      nombre: "",
      email: "",
      contrasena: ""
    };

    this.vcl = {
      id: Date.now(),
      marca: "",
      modelo: "",
      date: 1994
    };
    this.tieneVehiculo = false; 
  }
}
