import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from "../models/User.model";
import { UserService } from "../services/user.service";
import { WebsocketService } from "../services/websocket.service";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NavigationService } from '../navigation.service';

@Component({
  selector: "app-accueil",
  templateUrl: "./accueil.component.html",
  styleUrls: ["./accueil.component.css"]
})
export class AccueilComponent implements OnInit {
  user: User;
  opened : boolean = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private webSocketService: WebsocketService,
    private navigationService : NavigationService
  ) {
    this.webSocketService.userSaved().subscribe(data => {
      this.user = data;
      // console.log(data)
      // alert("Bienvenue "+this.user.pseudo)
      localStorage.setItem("user", JSON.stringify(this.user))
      this.router.navigate(["wait"]);
    });

    this.webSocketService.userAlreadySaved().subscribe(data => {
      this.opened = true;
      alert("Votre compte était déjà ouvert ailleurs, l'ancienne session devra donc être fermée.")
    });

  }

  ngOnInit() {
    if(localStorage.getItem("user")){
      this.user = JSON.parse(localStorage.getItem("user"))
      this.userService.connectUser(this.user);
    }
   }

  OnSubmit(form: NgForm) {
    if (form.value.pseudo && !this.opened && form.value.pseudo.length <=8){
      this.userService.connectUserByPseudo(form.value.pseudo);
      form.reset();
    } else {
      if(this.opened){
        alert("Veuillez fermer la fenetre ouverte et actualisez cette page")
      }
      if (form.value.pseudo.length > 8){
        this.navigationService.openSnackBar({message : "Votre nom est trop long (8 maximum)", action : "FERMER"})
      }
    }
    
  }
}
