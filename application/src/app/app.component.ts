import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { NavigationService } from './navigation.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'application';

  constructor(private webSocket: WebsocketService, private navigationService :NavigationService){

    // Notification.requestPermission();

    this.webSocket.error().subscribe((message) => {
      this.navigationService.openSnackBar({message : message, action : "FERMER", duration : 5000})
    
    }, (err) => {
      console.log(err)
    })

    this.webSocket.notifications().subscribe((message)=>{
      this.navigationService.openSnackBar({ message: message, action: "FERMER", duration: 5000 })

      // new Notification("CheckGamesMaster - Message du serveur", { "body": message , "dir": "auto", "icon": "https://cards.lamater.tech/assets/favicon.ico" })
    }, (err) => {
      console.log(err)
    })  

    this.webSocket.deconnexion().subscribe(()=>{
      window.location.reload();
    }, (err)=>{
      console.log(err)
    })
  }

}
