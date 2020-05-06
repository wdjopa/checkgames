import { Component, OnInit } from '@angular/core';
import { Partie } from 'src/app/models/Partie.model';
import { UserService } from 'src/app/services/user.service';
import { PartieService } from 'src/app/services/partie.service';
import { WebsocketService } from 'src/app/services/websocket.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgNavigatorShareService } from 'ng-navigator-share';

@Component({
  selector: 'app-join',
  templateUrl: './join.component.html',
  styleUrls: ['./join.component.css']
})
export class JoinComponent implements OnInit {
  objectKeys = Object.keys;

  partie: Partie;
  btndisabled : boolean = false;


  constructor(private userService: UserService, private partieService: PartieService, private webSocketService: WebsocketService, private router: Router, private route: ActivatedRoute, private ngNavigatorShareService: NgNavigatorShareService) {
    this.webSocketService.updatePartie().subscribe(partie => {
      this.partie = partie
      // console.log(partie)
      if(partie.etat == 2){
        this.router.navigate(["/room/play/"+partie.id]);
      }
      localStorage.setItem("partie", JSON.stringify(this.partie))

    })
  }

  ngOnInit() {
    this.partie = this.partieService.getPartie()
  }

  quit(){
    this.webSocketService.quitRoom(this.partie.id)
    localStorage.removeItem("partie")
    localStorage.removeItem("currentid")
    this.router.navigate(["wait"])
  }

  start(){
    this.webSocketService.lancer(this.partie.id)
    this.btndisabled=true;
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

    alert("Vous pouvez partager")
  }
}
