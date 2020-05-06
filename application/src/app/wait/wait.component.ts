import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { Partie } from '../models/Partie.model';
import { PartieService } from '../services/partie.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent implements OnInit {
  partie:Partie
  joinRoom : Subscription;


  constructor(private userService: UserService, private partieService : PartieService, private websocketService : WebsocketService, private router:Router) {
    this.joinRoom = this.websocketService.joinedRoom().subscribe(data => {
      this.partie = data;
      console.log(data)
      partieService.setPartie(this.partie)
      // alert("Bienvenue "+this.user.pseudo)
    }); 
    if(localStorage.getItem("currentid")){
      // L'utilisateur est arrivé ici via un lien
      this.websocketService.joinRoom(localStorage.getItem("currentid"));
    }

  }

  ngOnInit() {

  }

  ngOnDestroy(){
    // this.joinRoom.unsubscribe()
  }

  OnSubmit(form: NgForm) {
    if (form.value.code)
      this.websocketService.joinRoom(form.value.code);
    form.reset();
  }

  new_game(){
    this.websocketService.newGame(this.userService.getUser());
    console.log("Clic sur le bouton de création de partie")
  }
}
