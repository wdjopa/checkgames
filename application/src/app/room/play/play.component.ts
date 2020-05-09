import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { WebsocketService } from 'src/app/services/websocket.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { MatSnackBar, MatDialogRef, MatDialog } from '@angular/material';


@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css']
})
export class PlayComponent implements OnInit {
  objectKeys = Object.keys;
  partie: any = {};
  partieObjectKeys: any = [];
  user: any = {};
  choiceActive = false;
  loading = false;
  message: any = { text: "" };
  messages: any[] = [];
  dialogRef: any = null;
  end = false;
  unreadMessages = 0;
  lastTotalMessages = 0;
  messagesColor = {}
  colorsMessages = ["forestgreen", "maroon", "dodgerblue", "purple", "Crimson", "DarkTurquoise", "Brown", "YellowGreen"]

  @ViewChild('scrollMe', { static: false }) private myScrollContainer: ElementRef;

  constructor(private webSocket: WebsocketService, private userService: UserService, private route: ActivatedRoute, private _snackBar: MatSnackBar, public dialog: MatDialog) {

  }

  ngOnInit() {
    this.user = this.userService.getUser();
    console.log("user", this.user)
    this.messagesColor[this.user.pseudo] = {}
    this.messagesColor[this.user.pseudo].color = "#FF6600";
    // Recevoir les mises à jour sur la partie
    this.webSocket.updatePartie().subscribe(data => {
      console.log("partie ", data)
      this.partie = data;
      if(this.partie){
        console.log("verif", this.partie.jeu.dessous_pioche.length)
        localStorage.setItem("partie", JSON.stringify(this.partie)) // sauvegarde en local
        this.user = this.partie.users[this.user.pseudo];
        if(this.objectKeys(this.messagesColor).length<2){
          let co = 0
          for(let ps in this.partie.users){
            this.messagesColor[ps] = {}
            this.messagesColor[ps].color = this.colorsMessages[co];
            co++
          }
        }

        this.partieObjectKeys = this.objectKeys(data.users)
        if (this.messages.length != this.partie.messages) {
          setTimeout(() => {
            this.scrollToBottom()
          }, 500);
        }
        this.messages = this.partie.messages;
        if(this.lastTotalMessages < this.messages.length){
          this.unreadMessages = this.messages.length - this.lastTotalMessages
          this.lastTotalMessages = this.messages.length
          console.log("messages non lus", this.unreadMessages)
        }

        if (this.partie.etat == 3) {

          this.end = true;
          this._snackBar.open("GAAAAMMMEESSSS !!! La partie est terminée. Félicitations à " + this.partie.gagnant + ". 🎉", "FERMER", {
            duration: 10000,
          });
          setTimeout(() => {
            // Pour leffet de neige
            window["initial"]()
            window["init"]()
          }, 2000);

          setTimeout(() => {
            window.location.reload()
          }, 5000);
        } else {
          setTimeout(() => {
            this.scrollToRight()
          }, 500);
          if (this.user.pseudo == this.partie.main) {
            // this._snackBar.open("C'est à vous de jouer", "FERMER", {
            //   duration: 5000,
            // });
            
            if (this.partie.jeu.carte_centre[0] == "J" && !this.choiceActive && this.partie.main == this.user.pseudo) {

              this.dialogRef = this.dialog.open(CommanderModal, {
                width: '700px',
              });
              this.choiceActive = true;
              this.dialogRef.afterClosed().subscribe((result) => {
                console.log('The dialog was closed', result);
                if (result) {
                  // this.loadComponent = this.dialog.open(LoaderComponent, { data: { message: "Chargement ..." }, disableClose: true })  

                  if (this.choiceActive === true) {
                    this.webSocket.commande(this.partie.id, result, this.choiceActive)
                    this.choiceActive = false;
                    this.dialog.closeAll()
                  }
                }
              });
            }
          }

        }
      }else{
        localStorage.removeItem("partie")
        window.location.reload()
      }

    })
    this.webSocket.getPartieData(this.route.snapshot.paramMap.get("id"))

    this.webSocket.pasTonTour().subscribe(() => {
      this._snackBar.open("Ce n'est pas votre tour de jouer", "FERMER", {
        duration: 5000,
      });
      // alert(this.user.pseudo+", ce n'est pas votre tour. C'est à "+this.partie.main)
    })

    this.webSocket.commander().subscribe(() => {
      // faire une commande
      this.choiceActive = true;
      // if (this.dialogRef){
      //   this.dialogRef = null
      //   return;
      // } 
      this.dialogRef = this.dialog.open(CommanderModal, {
        width: '700px',
      });
      this.dialogRef.afterClosed().subscribe((result) => {
        console.log('The dialog was closed', result);
        if (result) {
          // this.loadComponent = this.dialog.open(LoaderComponent, { data: { message: "Chargement ..." }, disableClose: true })  
          if (this.choiceActive === true) {
            this.webSocket.commande(this.partie.id, result, this.choiceActive)
            this.dialog.closeAll()
            this.choiceActive = false;
          }
        }
      });
    })

    this.webSocket.newMessageReceived().subscribe((mess) => {
      if (!this.messages.includes(mess)) {
        this.messages.push(mess)
        if (this.lastTotalMessages < this.messages.length) {
          this.unreadMessages += this.messages.length - this.lastTotalMessages
          this.lastTotalMessages = this.messages.length
          console.log("messages non lus", this.unreadMessages)
        }

        setTimeout(() => {
          this.scrollToBottom()
        }, 500);
      }
    })
  }

  remove(joueur) {
    if (this.partie.admin.pseudo == this.user.pseudo && this.partie.etat != 3) {
      if (confirm("Souhaitez vous retirer le joueur : " + joueur)) {
        this.webSocket.removePlayer(joueur, this.partie.id)
      }
    }
  }

  scrollToBottom(): void {
    try {
      window.document.querySelector(".messages").scrollTop = window.document.querySelector(".messages").scrollHeight;
      window.document.querySelector(".messages-box").scrollTop = window.document.querySelector(".messages-box").scrollHeight;
    } catch (err) { console.log("error scroll", err) }
  }

  scrollToRight(): void {
    try {
      window.document.querySelector(".scrollright").scrollLeft = window.document.querySelector(".scrollright .active")["offsetLeft"] - 30;
    } catch (err) { console.log("error scroll", err) }
  }

  // Afficher la boite de message
  printMessagesBox(){
    this.unreadMessages = 0
    setTimeout(() => {
      this.scrollToBottom()
    }, 500);
    window.document.querySelector(".messages-box-small")['style'].display="flex"
  }

  closeMessage(){
    window.document.querySelector(".messages-box-small")['style'].display = "none"
  }

  // Envoyer le message
  send() {
    if (this.message.text.length > 0) {
      this.message.sender = this.user
      this.webSocket.sendMessage({ ...this.message })
    }
    this.scrollToBottom()
    this.message.text = ""
  }

  piocher() {
    // this._snackBar.open("Vous essayez de piocher", "FERMER", {
    //   duration: 5000,
    // });
    if (this.partie.etat != 3) {

      if (this.user.pioche) {
        this.webSocket.piquer(this.partie.id)
      } else {
        this.webSocket.piocher(this.partie.id)
      }
    }
  }

  jouer(carte) {
    if (this.partie.etat != 3) {
      if (this.checkGamesPossibilities(carte)) {
        this.webSocket.jouer(this.partie.id, carte)
      } else {
        this._snackBar.open("Vous ne pouvez pas jouer cette carte", "FERMER", {
          duration: 5000,
        });
      }
    }
  }

  checkGamesPossibilities(carte): boolean {

    var motif = carte.split("")[carte.split("").length - 1], num = carte.substring(0, carte.length - motif.length);
    var motif_centre = this.partie.jeu.carte_centre.split("")[this.partie.jeu.carte_centre.split("").length - 1],
      num_centre = this.partie.jeu.carte_centre.substring(0, this.partie.jeu.carte_centre.length - motif_centre.length);
    let ret: boolean = false;
    console.log("main", motif, num)
    console.log("centre", motif_centre, num_centre)
    if (this.user.pioche && num != "7") {
      return false
    }
    if (num == "2") {
      ret = true;
    } else {
      if (num == "J") {
        ret = true;
      } else {
        if (motif == motif_centre || num == num_centre || (num_centre == "*" && motif == motif_centre)) {
          ret = true;
        }
      }
    }
    return ret;
  }

  quit() {
    if(confirm("Etes vous sur de vouloir quitter cette partie ?")){
      this.webSocket.quitRoom(this.partie.id);
    }
  }

}


/**Open an account modal */

@Component({
  selector: 'command-modal',
  templateUrl: 'command.html',
  styleUrls: ['./play.component.css']
})
export class CommanderModal implements OnInit {
  edit: boolean = false;
  loading = false;
  err: string;
  success: string;

  constructor(public dialogRef: MatDialogRef<CommanderModal>) {
  }

  ngOnInit() {
  }
  motif(letter) {
    this.dialogRef.close("*" + letter);
  }
}