import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { NavigationService } from './navigation.service';
import { MatDialog } from '@angular/material';
import { ChoiceModal } from './modals/choice/choice-modal';
import { Howl, Howler } from 'howler';

import {
  Router,
  // import as RouterEvent to avoid confusion with the DOM Event
  Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError
} from '@angular/router'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'application';
  splashscreen = false;
  // Sets initial value to true to show loading spinner on first load
  loading = true
  tempsChargement = 400;

  constructor(private router: Router, private webSocket: WebsocketService, private navigationService: NavigationService, private dialog: MatDialog) {

    this.router.events.subscribe((e: RouterEvent) => {
      this.navigationInterceptor(e);
    })
    // Notification.requestPermission();

    this.webSocket.error().subscribe((message) => {
      this.navigationService.openSnackBar({ message: message, action: "FERMER", duration: 5000 })
      if (message.toLowerCase().includes("cette partie n'est")) {
        localStorage.removeItem("partie")
        localStorage.removeItem("currentid")
      }
    }, (err) => {
      console.log(err)
    })

    this.webSocket.notifications().subscribe((message) => {
      if (message.includes("CHECK")) {
        new Howl({
          src: "assets/sounds/check.mp3",
          autoplay: true,
          volume: 0.5,
        })
      }
    
      this.navigationService.openSnackBar({ message: message, action: "FERMER", duration: 5000 })

      // new Notification("CheckGamesMaster - Message du serveur", { "body": message , "dir": "auto", "icon": "https://cards.lamater.tech/assets/favicon.ico" })
    }, (err) => {
      console.log(err)
    })

    this.webSocket.deconnexion().subscribe(() => {
      const dialogRef = this.dialog.open(ChoiceModal, {
        data: { message: "Vous avez été déconnecté. Veuillez actualisez 😊" },
        disableClose: true,
        backdropClass: "mat"
      })
      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          window.location.reload()
        } else {
          this.splashscreen = true;
        }
      })
    }, (err) => {
      console.log(err)
    })
  }

  // Shows and hides the loading spinner during RouterEvent changes
  navigationInterceptor(event: RouterEvent): void {
    if (event instanceof NavigationStart) {
      this.loading = true
    }
    if (event instanceof NavigationEnd) {
      if (localStorage.getItem("partie")) {
        setTimeout(() => {
          if (event instanceof NavigationEnd) {
            this.loading = false
          }
        }, this.tempsChargement);
      } else {
        this.loading = false
      }
    }

    // Set loading state to false in both of the below events to hide the spinner in case a request fails
    if (event instanceof NavigationCancel) {
      if (localStorage.getItem("partie")) {
        setTimeout(() => {
          if (event instanceof NavigationCancel) {
            this.loading = false
          }
        }, this.tempsChargement);
      } else {
        this.loading = false
      }
    }
    if (event instanceof NavigationError) {
      if (localStorage.getItem("partie")) {

        setTimeout(() => {
          if (event instanceof NavigationError) {
            this.loading = false
          }
        }, this.tempsChargement);
      } else {
        this.loading = false
      }
    }
  }
  reload() {
    window.location.reload();
  }

}
