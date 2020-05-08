import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
    private router: Router, private route: ActivatedRoute) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.isAuth) {
      return true;
    } else {
      let id = route.paramMap.get("id")
      if(id){
        // alert("has a game")
          // Si l'utilisateur arrive sur l'application avec un lien de partie, mais n'est pas connecté
         localStorage.setItem("currentid", id)
      }
      this.router.navigate(['/accueil']);
    }
  }
}