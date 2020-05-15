import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { User } from "../models/User.model";
import { UserService } from "../services/user.service";
import { WebsocketService } from "../services/websocket.service";
import { NgForm } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { NavigationService } from '../navigation.service';
import { MatDialog } from '@angular/material';
import { ChoiceModal } from '../modals/choice/choice-modal';

@Component({
  selector: "app-accueil",
  templateUrl: "./accueil.component.html",
  styleUrls: ["./accueil.component.css"]
})
export class AccueilComponent implements OnInit {
  user: User;
  opened : boolean = false;
  splashscreen = false;
  constructor(
    private router: Router,
    private userService: UserService,
    private webSocketService: WebsocketService,
    private navigationService : NavigationService,
    private dialog : MatDialog
  ) {
    this.webSocketService.userSaved().subscribe(({user, browserid}) => {
      this.user = user;
      // alert("Bienvenue "+this.user.pseudo)
      localStorage.setItem("user", JSON.stringify(this.user))
      localStorage.setItem("browserid", JSON.stringify(browserid))
      this.router.navigate(["wait"]);
    });

    this.webSocketService.userAlreadySaved().subscribe(data => {
      this.opened = true;
      this.navigationService.openSnackBar({message : "Ce pseudo est déjà utilisé", action : "OK"})
      // alert("Votre compte était déjà ouvert ailleurs, l'ancienne session devra donc être fermée.")
    });

  }

  reload(){
    window.location.reload()
  }
  ngOnInit() {
    if(localStorage.getItem("user") && localStorage.getItem("browserid")){
      this.user = JSON.parse(localStorage.getItem("user"))
      let browserid = JSON.parse(localStorage.getItem("browserid"))
      this.userService.connectUser(this.user, browserid, true);

      // const dialogRef = this.dialog.open(ChoiceModal,{
      //   data: { message: "Vous aviez une ancienne session, voulez vous la remplacer par celle ci ?" },
      //   disableClose: true,
      //   backdropClass: "mat"
      // })
      // dialogRef.afterClosed().subscribe((result)=>{
      //   if(result === true){
      //   }else{
      //     this.splashscreen = true;
      //   }
      // })
    }else{
      localStorage.removeItem("user")
      localStorage.removeItem("currentid")
      localStorage.removeItem("partie")
    }
   }

  OnSubmit(form: NgForm) {
    if (form.value.pseudo && form.value.pseudo.length <=8){
      this.userService.connectUserByPseudo(this.escapeHtml(form.value.pseudo));
      form.reset();
    } else {
      if (form.value.pseudo.length > 8){
        this.navigationService.openSnackBar({message : "Votre nom est trop long (8 maximum)", action : "FERMER"})
      }
    }
    
  }

  escapeHtml(unsafe) {
  return unsafe
    .replace(".", "")
    .replace(" ", "")
    .replace(",", "")
    .replace(/&/g, "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/"/g, "")
    .replace(/'/g, "");
}
}
