import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { WebsocketService } from '../services/websocket.service';
import { Router } from '@angular/router';
import { Partie } from '../models/Partie.model';
import { PartieService } from '../services/partie.service';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { User } from '../models/User.model';
import { SecureGameModal } from '../modals/secure-game/secure-game-modal';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'app-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.css']
})
export class WaitComponent implements OnInit {
  objectKeys = Object.keys;
  partie: Partie
  joinRoom: Subscription;
  user: User;
  code: string = "";
  parties: any[] = []
  partieObjectKeys: any = [];
  connectedPersonnes : string = "0"
  gamesPlaying : string = "0"

  constructor(private userService: UserService, public dialog: MatDialog,private partieService: PartieService, private websocketService: WebsocketService, private router: Router) {
    this.user = this.userService.getUser();


    this.joinRoom = this.websocketService.joinedRoom().subscribe(data => {
      this.partie = data;
      console.log(data)
      this.partieService.setPartie(this.partie)
      // alert("Bienvenue "+this.user.pseudo)
    });


    if (localStorage.getItem("currentid")) {
      // L'utilisateur est arrivé ici via un lien
      this.websocketService.joinRoom(localStorage.getItem("currentid"));
    }
  }

  ngAfterViewInit() {

    this.websocketService.getTotalUsers().subscribe((data) => {
      console.log("total users", data)
      this.connectedPersonnes = data
    })
    this.websocketService.getPartiesEncours().subscribe((data) => {
      console.log("total games", data)
      this.gamesPlaying = data
    })
    this.websocketService.askTotalUsers()
    this.websocketService.askTotalGames()


    setTimeout(() => {
      
    this.websocketService.launchTourGuide("wait", [{
      anchorId: 'newgameopen',
      content: 'Cliquez ici si vous souhaitez créer une nouvelle partie ouverte à tous',
      title: 'Nouvelle partie',
    }, {
        anchorId: 'newgameclose',
        content: 'Cliquez ici si vous souhaitez créer une nouvelle partie privée, protégée par un mot de passe',
        title: 'Nouvelle partie',
      }, {
      anchorId: 'wait.listeparties',
      content: "Ici, vous avez d'autres joueurs comme vous qui attendent des challengeurs 🔥. N'hésitez pas à les rejoindre !",
      title: 'Liste des parties en attente',
    }])
    }, 3000);
  }


  ngOnInit() {


    if (localStorage.getItem("currentid")) {
      // L'utilisateur est arrivé ici via un lien
      this.websocketService.joinRoom(localStorage.getItem("currentid"));
    }

    this.websocketService.getAllParties()

    this.websocketService.allPartiesDatas().subscribe((parties: any) => {
      console.log("parties", parties)
      // parties = parties.filter((value, index, obj)=> value.etat < 3);
      // parties = parties.forEach((partie)=>{
      //   partie.usersSize = Object.keys(partie.users).length
      // })
      this.partieObjectKeys = this.objectKeys(parties)
      this.parties = parties;
    })
  }

  ngOnDestroy() {
    // this.joinRoom.unsubscribe()
  }

  deconnexion() {
    localStorage.removeItem("partie")
    localStorage.removeItem("user")
    window.location.reload()
  }

  join(id) {
    if(this.parties[id].code){
      this.dialog.open(SecureGameModal, { data: { code: this.parties[id].code, unlock: true } })
        .afterClosed().subscribe((result) => {
          if(result){
           this.websocketService.joinRoom(id);
          }
        })
    }else{
      this.websocketService.joinRoom(id);
    }
  }

  OnSubmit(form: NgForm) {
    if (form.value.code)
      this.websocketService.joinRoom(form.value.code);
    form.reset();
  }

  new_game(secure) {
    if(secure){
      this.dialog.open(SecureGameModal, {data:{code : "", unlock : false }})
      .afterClosed().subscribe((result)=>{
        this.websocketService.newGame(this.userService.getUser(), result.toLowerCase());
      })
    }else{
      this.websocketService.newGame(this.userService.getUser());
    }
    console.log("Clic sur le bouton de création de partie")
  }
}
