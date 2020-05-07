import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor( private _snackBar: MatSnackBar) { }

  openSnackBar({ message, action, duration = 2000 }) {
    this._snackBar.open(message, action, {
      duration: duration,
    });
  }
}
