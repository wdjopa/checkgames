import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from "../models/User.model";
import { UserService } from "../services/user.service";
import { WebsocketService } from "../services/websocket.service";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-accueil",
  templateUrl: "./accueil.component.html",
  styleUrls: ["./accueil.component.css"]
})
export class AccueilComponent implements OnInit {
  user: User;

  constructor(
    private router: Router,
    private userService: UserService,
    private webSocketService: WebsocketService
  ) {
    this.webSocketService.userSaved().subscribe(data => {
      this.user = data;
      console.log(data)
      // alert("Bienvenue "+this.user.pseudo)
      localStorage.setItem("user", JSON.stringify(this.user))
      this.router.navigate(["wait"]);
    });

    this.webSocketService.userAlreadySaved().subscribe(data => {
      alert("Votre compte était déjà ouvert ailleurs, l'ancienne session sera donc fermée.")
    });

  }

  ngOnInit() {
    if(localStorage.getItem("user")){
      this.user = JSON.parse(localStorage.getItem("user"))
      this.userService.connectUser(this.user);
    }
   }

  OnSubmit(form: NgForm) {
    if (form.value.pseudo)
    this.userService.connectUserByPseudo(form.value.pseudo);
    
    form.reset();
  }
}
