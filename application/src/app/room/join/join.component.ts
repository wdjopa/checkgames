import { Component, OnInit, OnDestroy } from '@angular/core';
import { Partie } from 'src/app/models/Partie.model';
import { UserService } from 'src/app/services/user.service';
import { PartieService } from 'src/app/services/partie.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { User } from 'src/app/models/User.model';
import { Subscription } from 'rxjs';
import { NavigationService } from 'src/app/navigation.service';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit, OnDestroy {
  objectKeys = Object.keys;

  partie: Partie;
  btndisabled: boolean = false;
  user: User;
  partieSubscription: Subscription;

  message: any = { text: "" };
  messages: any[] = [];
  unreadMessages = 0;
  lastTotalMessages = 0;
  messagesColor = {}
  colorsMessages = ["forestgreen", "maroon", "dodgerblue", "purple", "Crimson", "DarkTurquoise", "Brown", "YellowGreen"]


  constructor(private userService: UserService,  private navigationService: NavigationService, private partieService: PartieService, private webSocketService: WebsocketService, private router: Router, private route: ActivatedRoute, private ngNavigatorShareService: NgNavigatorShareService) {
    this.user = this.userService.getUser();

  }

  ngOnDestroy() {
    // this.partieSubscription.unsubscribe()
  }

  ngOnInit() {

    this.messagesColor[this.user.pseudo] = {}
    this.messagesColor[this.user.pseudo].color = "#FF6600";
    
    this.partie = this.partieService.getPartie()
    this.partieSubscription = this.webSocketService.updatePartie().subscribe(partie => {
      if (partie) {
        this.partie = partie
        // console.log(partie)
        if (this.user && this.user.pseudo) {
          this.user = this.partie.users[this.user.pseudo]
        }
        console.log(partie)
        if (partie.etat >= 1 && this.router.url !== "/room/play/" + partie.id) {
          this.router.navigate(["/room/play/" + partie.id]);
        }
        localStorage.setItem("partie", JSON.stringify(this.partie))

        
      }

    })


  }

  ngAfterViewInit(){
    setTimeout(() => {
      
    let steps = []
    if (window.innerWidth < 991) {
      steps = [{
        anchorId: 'join.quitter.small',
        content: "Si vous souhaitez quitter la partie, c'est ici ...",
        title: 'Quitter une partie',
      }, {
        anchorId: 'join.playersList.small',
        content: "Ici vous avez la liste des joueurs qui ont rejoint votre salon, vous pouvez attendre plus de joueurs ...",
        title: 'Liste des joueurs une partie',
      }, {
        anchorId: 'join.rules',
        content: "Ce sont ici les règles du jeu de check & games. Elles sont très proches des règles du 8 américain ou du UNO ...",
        title: 'Règles du jeu',
      }, {
        anchorId: 'join.share.small',
        content: "Une partie comme celleci peut accepter jusqu'à 8 joueurs, n'hésitez pas à partager le lien du jeu à vos amis pour plus d'amusement ...",
        title: 'Partager la partie',
      }, {
        anchorId: 'join.lancer.small',
        content: "Vous êtes l'admin 👑, vous êtes le seul à pouvoir lancer la partie. Quand des joueurs ont rejoint votre partie, vous pouvez la lancer pour commencer à jouer.",
        title: 'Lancer la partie',
      }]
    } else {
      steps = [{
        anchorId: 'join.share',
        content: "Une partie comme celleci peut accepter jusqu'à 8 joueurs, n'hésitez pas à partager le lien du jeu à vos amis pour plus d'amusement ...",
        title: 'Partager la partie',
      }, {
        anchorId: 'join.lancer',
        content: "Vous êtes l'admin 👑, vous êtes le seul à pouvoir lancer la partie. Quand des joueurs ont rejoint votre partie, vous pouvez la lancer pour commencer à jouer.",
        title: 'Lancer la partie',
      }, {
        anchorId: 'join.quitter',
        content: "Si vous souhaitez quitter la partie, c'est ici ...",
        title: 'Quitter une partie',
      },
      {
        anchorId: 'join.playersList',
        content: "Ici vous avez la liste des joueurs qui ont rejoint votre salon, vous pouvez attendre plus de joueurs ...",
        title: 'Liste des joueurs une partie',
      }, {
        anchorId: 'join.rules',
        content: "Ce sont ici les règles du jeu de check & games. Elles sont très proches des règles du 8 américain ou du UNO ...",
        title: 'Règles du jeu',
      },
      ]
    }

    this.webSocketService.launchTourGuide("join", steps)
    }, 4000);
  }

  quit() {
    this.webSocketService.quitRoom(this.partie.id)
    localStorage.removeItem("partie")
    localStorage.removeItem("currentid")
    this.router.navigate(["wait"])
  }

  start() {
    this.webSocketService.lancer(this.partie.id)
    this.btndisabled = true;
  }

  copyToClipboard() {
    let url = window.location.href;
    let selBox = document.createElement('textarea');

    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = url;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    selBox.setSelectionRange(0, 99999); /*For mobile devices*/
    document.execCommand('copy');
    document.body.removeChild(selBox);

    this.ngNavigatorShareService.share({
      title: 'Check & Games | La Mater Tech',
      text: "Je viens de lancer une partie de cartes, vous pouvez me rejoindre en cliquant sur le lien",
      url: url,
    }).then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));

    this.navigationService.openSnackBar({ message: "Vous pouvez partager", action: "OK" })
  }
}
