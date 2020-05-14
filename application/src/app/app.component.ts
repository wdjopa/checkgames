import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { NavigationService } from './navigation.service';
import { MatDialog } from '@angular/material';
import { ChoiceModal } from './modals/choice/choice-modal';
import { Howl, Howler } from 'howler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'application';
  splashscreen=false;

  constructor(private webSocket: WebsocketService, private navigationService :NavigationService, private dialog : MatDialog){

    // Notification.requestPermission();

    this.webSocket.error().subscribe((message) => {
      this.navigationService.openSnackBar({message : message, action : "FERMER", duration : 5000})
    
    }, (err) => {
      console.log(err)
    })

    this.webSocket.notifications().subscribe((message)=>{
      if(message.includes("CHECK")){
        new Howl({
          src: "assets/sounds/check.mp3",
          autoplay: true,
          volume: 0.5,
        })
      }
      if(message.includes("cette partie n'est")){
        localStorage.removeItem("partie")
        localStorage.removeItem("currentid")
      }
      this.navigationService.openSnackBar({ message: message, action: "FERMER", duration: 5000 })

      // new Notification("CheckGamesMaster - Message du serveur", { "body": message , "dir": "auto", "icon": "https://cards.lamater.tech/assets/favicon.ico" })
    }, (err) => {
      console.log(err)
    })  

    this.webSocket.deconnexion().subscribe(()=>{
      const dialogRef = this.dialog.open(ChoiceModal,{
        data: { message: "Vous avez été déconnecté. Continuer ?" },
        disableClose: true,
        backdropClass: "mat"
      })
      dialogRef.afterClosed().subscribe((result)=>{
        if(result === true){
          window.location.reload()
        }else{
          this.splashscreen = true;
        }
      })
    }, (err)=>{
      console.log(err)
    })
  }

  reload(){
    window.location.reload();
  }

}
