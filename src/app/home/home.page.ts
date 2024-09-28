import { Component, OnInit } from '@angular/core';
import { AuthServiceService } from '../services/auth-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  email: any;


  constructor(
    private authServi: AuthServiceService
  ) {}
  ngOnInit() {
    this.authServi.getUser().subscribe(user => {
      this.email = user?.email;
      console.log(user)
    })
  
  }

  

}
