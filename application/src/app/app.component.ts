import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'application';

  constructor(private webSocket: WebsocketService){
    this.webSocket.deconnexion().subscribe(()=>{
      window.location.reload();
    }, (err)=>{
      console.log(err)
      
    })
  }

}
