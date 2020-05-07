import { UserService } from "./user.service";
import { Injectable } from "@angular/core";
import * as io from "socket.io-client";
import { Observable } from "rxjs";
import { User } from "../models/User.model";
import { Partie } from '../models/Partie.model';

@Injectable()
export class WebsocketService {

    private socket = io("https://cards.lamater.tech:5200");
    // private socket = io("http://localhost:4000");

    constructor() { }

    saveUser(user: User) {
        this.socket.emit("connexion", user);
    }

    async newGame(user: User) {
        console.log("Envoie au socket")
        await this.socket.emit("new game", user);
    }

    lancer(id:string){
        this.socket.emit("lancer", id)
    }

    removePlayer(joueur:string, id:string){
        this.socket.emit("remove player", joueur, id)
    }

    nogame() {
        return new Observable<User>(
            observer => {
                this.socket.on("nogame", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    userSaved() {
        return new Observable<User>(
            observer => {
                this.socket.on("user saved", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }


    userAlreadySaved() {
        return new Observable<User>(
            observer => {
                this.socket.on("user already saved", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    updatePartie() {
        return new Observable<Partie>(
            observer => {
                this.socket.on("partie", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    pasTonTour(){
        return new Observable<Partie>(
            observer => {
                this.socket.on("pas ton tour", () => {
                    observer.next();
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    /**
     * Si le joueur n'a pas de carte, il peut piocher
     * @param id 
     */
    piocher(id) {
        console.log("pioche")
        this.socket.emit("pioche", id)
    }

    /**
     * Appelée lorsque le joueur devait bouffer des cartes suite à un pique lancé par le joueur précédent
     * @param id 
     */
    piquer(id) {
        console.log("pique")
        this.socket.emit("pique", id)
    }

    jouer(id, carte) {
        this.socket.emit("jouer", id, carte)
    }

    commande(id, carte){
        this.socket.emit("commande", id, carte)
    }

    commander() {
        // Lutilisateur recoit l'instruction de passer une commande
        return new Observable<any>(
            observer => {
                this.socket.on("commande", () => {
                    observer.next();
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    piocheDouble(){
        // L'utilisateur doit piocher à cause d'un Joker ou d'une carte pioche
        return new Observable<any>(
            observer => {
                this.socket.on("pioche double", (suivant, totalAPiocher) => {
                    let data = { pseudo: suivant, totalAPiocher: totalAPiocher }
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    retirerCarte() {
        // On retire une carte dans la main de l'utilisateur
        return new Observable<any>(
            observer => {
                this.socket.on("retirer carte", carte => {
                    observer.next(carte);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    carteCentre() {
        // On change la carte au centre de la table
        return new Observable<any>(
            observer => {
                this.socket.on("carte centre", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    getPartieData(id){
        this.socket.emit("get partie", id)
    }

    getAllParties() {
        this.socket.emit("all parties")
    }

    allPartiesDatas() {
        return new Observable<any>(
            observer => {
                this.socket.on("all parties", parties => {
                    observer.next(parties);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    quitRoom(id){
        this.socket.emit("quit", id);
    }

    joinRoom(data) {
        // console.log(data);
        this.socket.emit("join", data);
    }

    sendMessage(data) {
        this.socket.emit("message", data);
    }

    newMessageReceived() {
        const observable = new Observable<{ user: String; message: String }>(
            observer => {
                this.socket.on("new message", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
        return observable;
    }

    typing(data) {
        this.socket.emit("typing", data);
    }

    receivedTyping() {
        const observable = new Observable<{ isTyping: boolean }>(observer => {
            this.socket.on("typing", data => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    error() {
        return new Observable<string>(
            observer => {
                this.socket.on("error message", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    notifications(){
        return new Observable<string>(
            observer => {
                this.socket.on("notification", data => {
                    observer.next(data);
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }

    joinedRoom() {
        const observable = new Observable<Partie>(observer => {
            this.socket.on("join", data => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    }

    deconnexion() {
        return new Observable<User>(
            observer => {
                this.socket.on("disconnect", () => {
                    observer.next();
                });
                return () => {
                    this.socket.disconnect();
                };
            }
        );
    }
}
