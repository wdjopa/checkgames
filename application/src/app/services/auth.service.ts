import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/User.model';
import { UserService } from './user.service';
import { Router } from '@angular/router';


@Injectable()

export class AuthService {
  constructor(private httpClient: HttpClient, private router : Router) { }

    isAuth = false;

    signOut() {
        let user = new User();
        // this.userService.setUser(user);
        this.isAuth = false;
        this.router.navigate(['/accueil']);
    }
}