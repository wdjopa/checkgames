import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { PartieService } from './partie.service';

@Injectable()
export class PartieGuard implements CanActivate {

  constructor(private partieService: PartieService,
    private router: Router, private route: ActivatedRoute) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        if(this.partieService.hasAGame) {
          // faire une reconnexion avec la partie qui est stockée dans le localStorage
            return true;
        } else {
            this.router.navigate(['/accueil']);
        }
  }
}