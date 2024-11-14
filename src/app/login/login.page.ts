import { Component, OnInit } from '@angular/core';
import { Usuario } from '../interfaces/usuario';
import { AlertController, ToastController } from '@ionic/angular';
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
    id: Date.now().toString(),
    idUser: "",
    nombre: "",
    email: "",
    contrasena: ""
  }
  constructor(
    private AlertCtr : AlertController,
    private authService: AuthServiceService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
  }

 
  login() {
    this.authService.login(this.urs.email, this.urs.contrasena)
      .then(() => {
        // Mostrar mensaje de éxito si es necesario
        this.mostrarToast('Éxito', 'Inicio de sesión exitoso');
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

  async mostrarToast(titulo: string, mensaje: string) {
    const toast = await this.toastController.create({
      header: titulo,         
      message: mensaje,        
      duration: 1000,         
      position: 'bottom',      
      color: 'primary'      
    });
    await toast.present();
  }

}

