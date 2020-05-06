import { Partie } from '../models/Partie.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';
import { Router } from '@angular/router';

@Injectable()

export class PartieService {
  private partie: Partie;
  partieSubject = new Subject<Partie>();
  hasAGame = false;

  emitPartie() {
    this.partieSubject.next(this.partie);
  }


  setPartie(partie: Partie) {
    this.partie = partie;
    this.hasAGame = true;

    localStorage.setItem("partie", JSON.stringify(this.partie))
    this.router.navigate(["/room/join/" + this.partie.id]);
    // this.emitPartie();
  }


  joinPartie(id){
    this.websocketService.joinRoom(id)
  }

  getPartie(){
      return this.partie;
  }

  cancelPartie(){
    localStorage.removeItem("partie")
  }
    
  constructor(private httpClient: HttpClient, private authService: AuthService, private websocketService: WebsocketService, private router: Router) { }
}