import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";


import { WebsocketService } from "./services/websocket.service";
import { UserService } from "./services/user.service";
import { PartieService } from "./services/partie.service";
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./services/auth-guard.service";
import { PartieGuard } from "./services/partie-guard.service";


import {
  MatAutocompleteModule,
  MatBadgeModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatTreeModule,
  MatPaginatorIntl,
  MAT_DATE_LOCALE
} from '@angular/material';

import { DragDropModule } from '@angular/cdk/drag-drop';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AccueilComponent } from './accueil/accueil.component';
import { WaitComponent } from './wait/wait.component';
import { CreateComponent } from './room/create/create.component';
import { JoinComponent } from './room/join/join.component';
import { PlayComponent, CommanderModal } from './room/play/play.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationService } from './navigation.service';
import { ChoiceModal } from './modals/choice/choice-modal';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { TourMatMenuModule, TourService} from "ngx-tour-md-menu"
import { WinnerModal } from './modals/winner/winner-modal';
import { SecureGameModal } from './modals/secure-game/secure-game-modal';

const appRoutes: Routes = [
  { path: "accueil", component: AccueilComponent },
  { path: "wait", canActivate: [AuthGuard], component: WaitComponent },
  // { path: "room/new", canActivate: [AuthGuard], component: CreateComponent },
  { path: "room/join/:id", canActivate: [AuthGuard], component: JoinComponent },
  { path: "room/play/:id", canActivate: [AuthGuard, PartieGuard], component: PlayComponent },
    { path: "", component: AccueilComponent },
    // { path: "not-found", component: FourOhFourComponent },
    { path: "**", redirectTo: "" }
];


@NgModule({
  declarations: [AppComponent, AccueilComponent, WaitComponent, CreateComponent, JoinComponent, PlayComponent, CommanderModal, ChoiceModal, SecureGameModal,WinnerModal],

  entryComponents: [
    CommanderModal,
    WinnerModal,
    ChoiceModal,
    SecureGameModal,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    TourMatMenuModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    DragDropModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
  ],
  providers: [AuthService, AuthGuard, UserService, WebsocketService, PartieService, PartieGuard, NavigationService, TourService],
  bootstrap: [AppComponent]
})
export class AppModule {}
