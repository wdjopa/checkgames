import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { Partie } from '../models/Partie.model';
import { PartieService } from '../services/partie.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../models/User.model';

@Component({
  selector: 'app-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent implements OnInit {
  partie:Partie
  joinRoom : Subscription;
  user : User;
  code : string="";
  parties : any[] = []

  constructor(private userService: UserService, private partieService : PartieService, private websocketService : WebsocketService, private router:Router) {
    this.user = this.userService.getUser();
    this.joinRoom = this.websocketService.joinedRoom().subscribe(data => {
      this.partie = data;
      console.log(data)
      this.partieService.setPartie(this.partie)
      // alert("Bienvenue "+this.user.pseudo)
    }); 
    if(localStorage.getItem("currentid")){
      // L'utilisateur est arrivé ici via un lien
      this.websocketService.joinRoom(localStorage.getItem("currentid"));
    }
    this.websocketService.getAllParties()
    this.websocketService.allPartiesDatas().subscribe((parties:any)=>{
      console.log("parties", parties)
      this.parties = parties;
    })

  }

  ngOnInit() {

  }

  ngOnDestroy(){
    // this.joinRoom.unsubscribe()
  }

  deconnexion(){
    localStorage.removeItem("partie")
    localStorage.removeItem("user")
    window.location.reload()
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
