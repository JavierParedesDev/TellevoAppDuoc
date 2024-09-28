import { Component, OnInit } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthServiceService } from '../services/auth-service.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  urs:Usuario={
    id: Date.now(),
    nombre: "",
    email: "",
    contrasena: ""
  }
  constructor(
    private AlertCtr : AlertController,
    private authService: AuthServiceService
  ) { }

  ngOnInit() {
  }

 
  login() {
    this.authService.login(this.urs.email, this.urs.contrasena)
      .then(() => {
        // Mostrar mensaje de éxito si es necesario
        this.alertas('Éxito', 'Inicio de sesión exitoso');
      })
      .catch((error) => {
        // Manejar el error de autenticación
        this.alertas('Error', "");
      });
  }


  async alertas(mensaje: string,subtitulo:string){
    const alrt = await this.AlertCtr.create({
      header: mensaje,
      message: subtitulo,
      buttons: ["Aceptar"]
    })

    alrt.present()
  }

}

