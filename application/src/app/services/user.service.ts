import { User } from '../models/User.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { WebsocketService } from './websocket.service';

@Injectable()

export class UserService {
  private user: User;
  userSubject = new Subject<User>();

  emitUser() {
    this.userSubject.next(this.user);
  }

  connectUserByPseudo(pseudo : string){
    let user = new User()
    user.pseudo = pseudo
    user.updated_at = new Date()
    this.user = user;
    this.authService.isAuth = true;
    this.websocketService.saveUser(user);
  }

  connectUser(user: User) {
    user.updated_at = new Date()
    this.user = user;
    this.authService.isAuth = true;
    this.websocketService.saveUser(user);
  }

  setUser(user: User) {
    this.user = user;
    this.emitUser();
  }

  getUser(){
      return this.user;
  }
    
  constructor(private httpClient: HttpClient, private authService : AuthService, private websocketService : WebsocketService) { }
}