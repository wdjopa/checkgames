var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const uuidv4 = require("uuid/v4"); // <== NOW DEPRECATED!
var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");
app.use(bodyParser.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Allowing cross-origin sites to make requests to this API
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", "*");
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append(
    "Access-Control-Allow-Headers",
    "Origin, Accept,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  res.append("Access-Control-Allow-Credentials", true);
  next();
});

const socket = require("socket.io");

var parties = {};
var waitingTime = 3000;
var mongoPassword = "willaudyv2016";
var dbase = "dcafc3fe9a3456a911b404aae165817b";
var config = JSON.parse(
  '{"mongo": {"hostString": "6a.mongo.evennode.com:27017/dcafc3fe9a3456a911b404aae165817b","user": "dcafc3fe9a3456a911b404aae165817b","db": "dcafc3fe9a3456a911b404aae165817b"}}'
);
var MongoClient = require("mongodb").MongoClient;
var url =
  "mongodb://" +
  config.mongo.user +
  ":" +
  encodeURIComponent(mongoPassword) +
  "@" +
  config.mongo.hostString +
  "?replicaSet=eu-6";
MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbs) {
  if (err) {
    console.log(err);
    return false;
  }
  console.log("Connexion à la base de données réussie");

  db = dbs.db(dbase);

  db.createCollection("cartes_users", function (err, res) {
    if (err) console.log(err);
  });
  db.createCollection("cartes_games", function (err, res) {
    if (err) console.log(err);
  });

  let sockets_id = {};

  //  const server = app.listen(port, () => {
  //    console.log("Server started on port " + port + "...");
  //  });
  const io = socket.listen(global.server);

  io.sockets.on("connection", (socket) => {
    let currentUser = {};
    let partie = {};

    // Connexion d'un utilisateur
    socket.on("connexion", (user) => {
      // console.log("Connexion d'un utilisateur ", user, sockets_id);
      if (sockets_id[user.pseudo]) {
        // io.sockets.connected[sockets_id[user.pseudo].socket].close();
        socket.emit("user already saved", user);
      } else {
        user.points = 0;
        user.etat = false;
        user.cartes = [];
        currentUser = user;
        sockets_id[user.pseudo] = { user: user, socket: socket.id };
        socket.emit("user saved", user);
      }
    });

    // Nouvelle partie
    socket.on("new game", (user) => {
      user.etat = 1;
      partie.id = uuidv4().split("-")[0];
      partie.admin = user;
      partie.etat = 0;
      partie.limit = 8;
      partie.main = null;
      partie.jeu = {};
      partie.users = {};
      partie.users[user.pseudo] = user;
      partie.messages = [];
      partie.created_at = new Date();
      partie.updated_at = new Date();
      partie.messages.push({
        text: "Je viens de créer une partie",
        sender: user,
        date: new Date(),
      });
      parties[partie.id] = partie;
      socket.join(partie.id);
      console.log("Nouvelle partie", partie);
      io.in(partie.id).emit("join", partie);
      // console.log("broadcast new game", parties)
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
      //  io.sockets.emit("error message", "Il y a actuellement "+Object.size(parties)+" parties en cours")

      // socket.emit("")
    });

    // Get all parties
    socket.on("all parties", ()=>{
      // socket.emit("error message", "Il y a actuellement "+Object.size(parties)+" parties en cours")
      console.log("parties en cours", parties)
      let datas = {};
      for (let id in parties) {
        if (parties[id].etat < 2) datas[id] = parties[id];
      }
      socket.emit("all parties", datas);
    })
    
    // 'lancer event'
    socket.on("lancer", (id) => {
      if (parties[id]) {
        partie = parties[id];
        for (let pseudo in partie.users) {
          partie.users[pseudo].etat = 2;
        }
        // Partie effectivemnt lancée par l'admin
        partie.etat = 2;
        partie.jeu = {
          pioche: [
            "2c",
            "3c",
            "4c",
            "5c",
            "6c",
            "7c",
            "8c",
            "9c",
            "10c",
            "2d",
            "3d",
            "4d",
            "5d",
            "6d",
            "7d",
            "8d",
            "9d",
            "10d",
            "2h",
            "3h",
            "4h",
            "5h",
            "6h",
            "7h",
            "8h",
            "9h",
            "10h",
            "2s",
            "3s",
            "4s",
            "5s",
            "6s",
            "7s",
            "8s",
            "9s",
            "10s",
            "Ac",
            "Ad",
            "Ah",
            "As",
            "Jc",
            "Jd",
            "Jh",
            "Js",
            "Qc",
            "Qd",
            "Qh",
            "Qs",
            "Kc",
            "Kd",
            "Kh",
            "Ks",
          ],
          dessous_pioche: [],
          pioche_vide: 0,
          carte_centre: "",
          tour: 0,
        };
        console.log("lancement de la partie");
        // On fixe le joueur qui a la main
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        distribution(id);
        parties[id] = partie;
        io.in(id).emit("partie", partie);
      } else {
        socket.emit("error message", "Cette partie n'existe plus");
      }
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
    });

    /** */
    socket.on("pique", (id) => {
      partie = parties[id];
      currentUser = partie.users[currentUser.pseudo];
      console.log(currentUser, "doit piocher normalement", partie);
      if (currentUser.pioche && currentUser.pseudo == partie.main) {
        io.in(id).emit("notification", currentUser.pseudo + " prend "+currentUser.pioche+" cartes supplémentaires");
        io.in(id).emit("error message", currentUser.pseudo + " prend "+currentUser.pioche+" cartes supplémentaires");

        for (let i = 0; i < currentUser.pioche; i++) {
          piocher(id, currentUser.pseudo); // On pioche autant de fois que necessaire
          console.log("pioche n°", i);
        }
        delete parties[id].users[currentUser.pseudo].pioche; // on supprime la pioche
        currentUser = parties[id].users[currentUser.pseudo]; // on met à jour l'utilisateur
        partie = parties[id];
        //On passe la main au joueur suivant
        partie.jeu.tour++;
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        io.in(id).emit("partie", partie);
      }
    });

    /** Un joueur souhaite piocher */
    socket.on("pioche", function (id) {
      if (currentUser.pseudo == parties[id].main) {
        piocher(id, currentUser.pseudo);
        partie = parties[id]; // On met à jour la partie du joueur
        //On passe la main au joueur suivant
        partie.jeu.tour++;
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        io.in(id).emit("partie", partie);
        // io.in(id).emit("tour", id, sessions[id].participants[parties[id].tour]);
      } else {
        socket.emit("pas ton tour");
        console.log(
          currentUser.pseudo + " a voulu jouer alors que cetait pas son tour."
        );
      }
    });

    /** un joueur essaie de jouer une carte */
    socket.on("jouer", (id, carte) => {
      try {
        partie = parties[id];
        if (currentUser.pseudo == partie.main) {
          var { r, commande } = jouer(id, currentUser.pseudo, carte);
          if (r || commande) {
            //On passe la main au joueur suivant
            partie = parties[id];
            partie.jeu.tour += r;
            let allUsers = Object.keys(partie.users);
            partie.jeu.tour %= allUsers.length;
            partie.main = allUsers[partie.jeu.tour];
            parties[id] = partie;
            currentUser = parties[id].users[currentUser.pseudo];
            // On met à jour les cartes
            // Si la partie est finie,
            if (currentUser.cartes.length == 0) {
              // Fin de la partie
              partie = parties[id];
              io.in(id).emit("partie", partie);
              parties[id].etat = 3;
              parties[id].gagnant = currentUser.pseudo;
            } else if (currentUser.cartes.length == 1) {
              io.in(id).emit("notification", currentUser.pseudo+" annonce 'CHECK !' ")
              partie.messages.push({
                text: "CHECK",
                sender: currentUser,
                date: new Date(),
              });
            }
            partie = parties[id];
            io.in(id).emit("partie", partie);

            // On definit le timer pour le joueur suivant
            // if (parties[id].timer) {
            //   clearTimeout(parties[id].timer);
            // }
            // parties[id].timer = setTimeout(bouffeAuto,waitingTime,parties[id].main,id);
            if (commande) {
              //Le J commande, donc le joueur doit choisir la carte qu'il commande
              socket.emit("commande");
            }
          } else {
          }
        } else {
          socket.emit("pas ton tour");
          console.log(
            currentUser.pseudo + " a voulu jouer alors que cetait pas son tour."
          );
        }
      } catch (err) {
        console.log(err);
        socket.emit("reset", id, err);
      }
    });

    socket.on("remove player", (joueur, id) => {
      if (parties[id] && parties[id].users[joueur]) {
        parties[id].jeu.dessous_pioche.push(parties[id].users[joueur].cartes); // on met ses cartes dans la pioche
        if(parties[id].main == joueur){
          parties[id].main = nextValue(parties[id].users, joueur);
        }
        delete parties[id].users[joueur];
        if (sockets_id[joueur])
          io.sockets.connected[sockets_id[joueur].socket].emit("quit");
        // sockets_id[joueur].socket
        partie = parties[id];
        io.in(id).emit("partie", partie);
      }
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
    });

    function bouffeAuto(joueur, id) {
      io.in(id).emit("error message", "Bouffe auto pour " + joueur);
      // Au bout du delai, je fais bouffer automatiquement et je passe la main
      console.log("Bouffe Auto");
      console.log(parties[id]);
      piocher(id, joueur); // On pioche autant de fois que necessaire
      parties[id].users[joueur].autoPlay++; // on met à jour l'utilisateur
      if (parties[id].users[joueur].autoPlay > 2) {
        // 2 jeux automatiques, on sort le joueur
        parties[id].jeu.dessous_pioche.push(parties[id].users[joueur].cartes); // on met ses cartes dans la pioche
        delete parties[id].users[joueur];
      }
      let partie = parties[id];
      console.log(partie);
      //On passe la main au joueur suivant
      partie.jeu.tour++;
      let allUsers = Object.keys(partie.users);
      partie.jeu.tour %= allUsers.length;
      partie.main = allUsers[partie.jeu.tour];
      parties[id] = partie;
      io.in(id).emit("partie", partie);

      // On definit le timer pour le joueur suivant
      if (parties[id].timer) {
        clearTimeout(parties[id].timer);
      }
      parties[id].timer = setTimeout(
        bouffeAuto,
        waitingTime,
        parties[id].main,
        id
      );
    }

    /** un joueur essaie de jouer une carte */
    socket.on("commande", (id, carte) => {
      try {
        partie = parties[id];
        partie.jeu.carte_centre = carte;
        partie.jeu.tour++;
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        io.in(id).emit("notification", currentUser.pseudo+" a commandé  ")
        io.in(id).emit("partie", partie);
      } catch (err) {
        console.log(err);
        socket.emit("reset", id, err);
      }
    });

    // Get data for a partie
    socket.on("get partie", (id) => {
      if (parties[id].users[currentUser.pseudo]) {
        io.in(id).emit("partie", parties[id]);
        socket.emit("partie", parties[id]);
      }
    });

    // enregistrer un message
    socket.on("message", (message) => {
      if (partie && parties[partie.id]) {
        message.date = new Date();
        parties[partie.id].messages.push(message);
        partie = parties[partie.id];
        io.in(partie.id).emit("new message", message);
      }
    });
    // 'join event'
    socket.on("join", (id) => {
      // console.log(currentUser);
      if (parties[id]) {
        let allUsers = Object.keys(parties[id].users);
        if (allUsers.length >= parties[id].limit) {
          socket.emit("error message", "La session est pleine.");
        } else {
          let message = {
            text:
              "Salut, je suis " +
              currentUser.pseudo +
              ", je souhaite rejoindre votre partie",
            sender: currentUser,
            date: new Date(),
          };
          partie = parties[id];
          // On s'assure que l'utilisateur n'était pas deja inscrit à la partie
          let dejala = false;
          if (partie.users[currentUser.pseudo]) dejala = true;

          if (!dejala) {
            if (parties[id].etat < 2) {
              // si la partie n'a pas encore été lancée
              // si l'utilisateur n'est pas encore inscrit (premiere fois)
              socket.join(id);
              currentUser.etat = 1;
              partie.users[currentUser.pseudo] = currentUser;
              partie.messages.push(message);
              io.in(partie.id).emit("join", partie);
              io.in(partie.id).emit("partie", partie);
              io.in(partie.id).emit("new message", message);
              console.log(currentUser.pseudo + " a rejoint une partie", partie);
              parties[id] = partie;
            } else {
              // la partie a déjà débuté
              socket.emit("in game", id, parties[id].etat);
            }
          } else {
            if (parties[id].etat == 3) {
              currentUser.etat = 0;
              socket.leave(id);
            } else {
              socket.join(id);
              // L'utilisateur vient de se reconnecter, on remet son etat à 1
              for (let pseudo in partie.users) {
                if (!partie.users[pseudo]) {
                  // Si le champ pseudo manque, on supprime cet utilisateur
                  delete partie.users[pseudo];
                } else {
                  partie.users[pseudo].etat = 1;
                }
              }
              parties[id] = partie;
              io.in(partie.id).emit("join", partie);
              io.in(partie.id).emit("partie", partie);
              console.log(currentUser.pseudo + " était deja là");
            }
          }
        }
      } else {
        socket.emit("error message", "Cette partie n'est pas disponible")
        socket.emit("nogame", id);
      }
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
    });

    socket.on("quit", (id) => {
      if (parties[id]) {
        partie = parties[id];
        if(parties[id].jeu.dessous_pioche){
          parties[id].jeu.dessous_pioche.push(parties[id].users[currentUser.pseudo].cartes); // on met ses cartes dans la pioche
        }
        delete partie.users[currentUser.pseudo];
        currentUser.etat = 0;
        parties[id] = partie;
        partie = {};

        if (Object.size(parties[id].users) == 0) {
          // S'il n'y a plus de joueurs dans la partie, on supprime la partie
          delete parties[id];
        }
        io.in(id).emit("partie", parties[id]);
      }
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
      socket.leave(id);
    });

    socket.on("disconnect", () => {
      if (sockets_id[currentUser.pseudo]) {
        delete sockets_id[currentUser.pseudo];
      }
      if (partie && partie.id && parties[partie.id]) {
        // En cas de déconnexion, l'utilisateur passe à l'état 0 et on lance une tentative de reconnexion
        for (let i in partie.users) {
          if (partie.users[i].pseudo === currentUser.pseudo) {
            partie.users[i].etat = 0;
          }
        }
        io.in(partie.id).emit("partie", partie);
      }
      socket.emit("deconnexion");
       let datas = {};
       for (let id in parties) {
         if (parties[id].etat < 2) datas[id] = parties[id];
       }
       io.sockets.emit("all parties", datas);
      // parties[partie.id].users.remove(currentUser);
    });

    function distribution(id) {
      var n = 4;
      //Distribution de n cartes au debut
      for (let user of Object.keys(partie.users)) {
        for (var j = 0; j < n; j++) {
          if(partie.users[user].cartes){
            piocher(id, user);
          }
        }
      }
      //tableau (carte du milieu)
      do {
        do {
          var ran = random(0, partie.jeu.pioche.length);
          console.log("ran", ran);
          partie.jeu.carte_centre = partie.jeu.pioche[ran];
        } while (!partie.jeu.carte_centre);
      } while (
        partie.jeu.carte_centre.split("")[0] == "A" ||
        partie.jeu.carte_centre.split("")[0] == "J" ||
        partie.jeu.carte_centre.split("")[0] == "7"
      );
      partie.jeu.pioche = partie.jeu.pioche.filter((value, index, arr) => {
        return index != ran;
      });
      // delete partie.jeu.pioche[ran];
      parties[id] = partie;
      io.in(id).emit("partie", partie);
    }

    function  piocher(id, pseudo, distrib = 0) {
      // if (partie.jeu.pioche_vide) {
      //   partie.jeu.pioche = partie.jeu.dessous_pioche;
      //   partie.jeu.dessous_pioche = [];
      //   partie.jeu.pioche_vide = 0;
      //   console.log("Vous ne pouviez plus piocher");
      // }
      if (!parties[id].pioche_vide) {
        var ran;
        if (distrib)
          do {
            ran = random(0, partie.jeu.pioche.length);
            var card = partie.jeu.pioche[ran];
            var motif = card.split("")[card.split("").length - 1];
            num = card.split(motif)[0];
          } while (num != "7" && !partie.jeu.pioche[ran]);
        else
          do {
            ran = random(0, partie.jeu.pioche.length);
          } while (!partie.jeu.pioche[ran]);

        partie.users[pseudo].cartes.push(partie.jeu.pioche[ran]);
        partie.jeu.pioche = partie.jeu.pioche.filter((value, index, arr) => {
          return index != ran && arr[index];
        });

        // delete partie.jeu.pioche[ran];

        // io.in(id).emit("pioche", pseudo, parties[id].jeu.pioche[ran]);
        // io.in(id).emit("partie", parties[id])
        // partie = parties[id]
        // console.log(
        //   "Partie n°" +
        //     id +
        //     ": " +
        //     nom +
        //     " a piocher la carte " +
        //     parties[id].pioche[ran]
        // );
        //joueurs.push(pioche[ran]);
        // supprbypos(ran, parties[id].pioche);
        if (partie.jeu.pioche.length < 1) {
          //Lorqu'il reste une carte dans la pioche
          if (partie.jeu.dessous_pioche.length > 1) {
            //Alors, on prend les cartes qui sont en dessous de la carte du centre
            for (var i = 0; i < partie.jeu.dessous_pioche.length; i++) {
              partie.jeu.pioche.push(partie.jeu.dessous_pioche[i]);
            }
            partie.jeu.dessous_pioche = [];
          } else {
            //La pioche est vide
            io.sockets.emit("error message", "La pioche est vide")
            partie.jeu.pioche_vide = 1;
          }
        }
        parties[id] = partie;
      } else {
        console.log("Vous ne pouvez plus piocher");
        io.sockets.emit("error message", "Vous ne pouvez plus piocher de carte");
      }
    }

    function jouer(id, nom, card, nombre_de_cartes_a_piocher = 2) {
      var motif = card.split("")[card.split("").length - 1],
        num = card.substring(0, card.length - motif.length);
      var motif_centre = parties[id].jeu.carte_centre.split("")[
          parties[id].jeu.carte_centre.split("").length - 1
        ],
        num_centre = parties[id].jeu.carte_centre.substring(
          0,
          parties[id].jeu.carte_centre.length - motif_centre.length
        );

      console.log(motif + " <> " + motif_centre);
      console.log(num + " <> " + num_centre);

      let r = 0,
        commande = false;

      if (num == "2") {
        //Le  numéro de la carte jouée est 2 (passe partout)
        r = 1;
        parties[id].jeu.dessous_pioche.push(card); //En dessous du centre on met la carte 2 là

        //On la retire de la main du joueur
        parties[id].users[currentUser.pseudo].cartes = parties[id].users[
          currentUser.pseudo
        ].cartes.filter((carte) => carte != card);
        currentUser = parties[id].users[currentUser.pseudo];
        socket.emit("retirer carte", card);
      } else {
        if (num == "J") {
          //Lorsquil commande, le motif devient le motif quil a commandé et le numero devient une etoile

          //On la met sur la table
          if (num_centre != "*")
            // Si la carte du milieu est une * cest que cest un modele de carte "commandée"
            parties[id].jeu.dessous_pioche.push(parties[id].carte_centre);
          parties[id].jeu.carte_centre = card;
          // io.in(id).emit("carte centre", parties[id].jeu.carte_centre);

          //On la retire de la main du joueur
          parties[id].users[currentUser.pseudo].cartes = parties[id].users[
            currentUser.pseudo
          ].cartes.filter((carte) => carte != card);
          currentUser = parties[id].users[currentUser.pseudo];
          commande = true;

          // partie = parties[id];
          // io.in(id).emit("partie", partie);
          // socket.emit("retirer carte", card);
        } else {
          if (
            motif == motif_centre ||
            num == num_centre ||
            (num_centre == "*" && motif == motif_centre)
          ) {
            if (num == "As" || num == "A") {
              //Le A stoppe le joueur et on passe le joueur qui suit
              r = 2;

              //On la met sur la table
              if (num_centre != "*" && parties[id].jeu.carte_centre)
                // Si la carte du milieu est une * cest que cest un modele de carte "commandée"
                parties[id].jeu.dessous_pioche.push(
                  parties[id].jeu.carte_centre
                );
              parties[id].jeu.carte_centre = card;
              io.in(id).emit("carte centre", parties[id].jeu.carte_centre);

              //On la retire de la main du joueur
              parties[id].users[currentUser.pseudo].cartes = parties[id].users[
                currentUser.pseudo
              ].cartes.filter((carte) => carte != card);
              currentUser = parties[id].users[currentUser.pseudo];

              socket.emit("retirer carte", card);
            } else {
              if (num == "7") {
                //On essaie de faire piocher le joueur suivant
                let suivant = nextValue(parties[id].users, nom);
                console.log(
                  nom +
                    " dans la partie créée par " +
                    parties[id].admin.pseudo +
                    " a joué " +
                    card +
                    " et " +
                    suivant.pseudo +
                    " doit piocher " +
                    nombre_de_cartes_a_piocher +
                    " cartes supplémentaires."
                );

                // io.in(id).emit(
                //   "pioche double",
                //   suivant,
                //   nombre_de_cartes_a_piocher
                // );

                //On la met sur la table
                if (num_centre != "*" && parties[id].jeu.carte_centre)
                  // Si la carte du milieu est une * cest que cest un modele de carte "commandée"
                  parties[id].jeu.dessous_pioche.push(
                    parties[id].jeu.carte_centre
                  );
                parties[id].jeu.carte_centre = card;
                // io.in(id).emit("carte centre", parties[id].jeu.carte_centre);

                //On la retire de la main du joueur
                parties[id].users[currentUser.pseudo].cartes = parties[
                  id
                ].users[currentUser.pseudo].cartes.filter(
                  (carte) => carte != card
                );

                if (parties[id].users[currentUser.pseudo].pioche) {
                  let p = parties[id].users[currentUser.pseudo].pioche;
                  delete parties[id].users[currentUser.pseudo].pioche;
                  parties[id].users[suivant.pseudo].pioche =
                    p + nombre_de_cartes_a_piocher;
                } else {
                  parties[id].users[
                    suivant.pseudo
                  ].pioche = nombre_de_cartes_a_piocher; // on fait piocher le suivant
                }
                currentUser = parties[id].users[currentUser.pseudo];
                r = 1;
                /*
                //On passe la main au joueur suivant.
                partie = parties[id];//les 4 lignes du bas ont été copiées j'ai eu la flemme de changer en parties[id] partout, du coup j'ajoute cette ligne
                partie.jeu.tour++;
                let allUsers = Object.keys(partie.users);
                partie.jeu.tour %= allUsers.length;
                partie.main = allUsers[partie.jeu.tour];
                parties[id] = partie;
                io.in(id).emit("partie", parties[id]);
                */
                // socket.emit("retirer carte", card);
              } else {
                r = 1;
                console.log(
                  nom +
                    " dans la partie créée par " +
                    parties[id].admin.pseudo +
                    " a joué " +
                    card
                );
                //si la carte proposée correspond aux criteres, alors elle est jouée.

                //On la met sur la table
                if (num_centre != "*" && parties[id].jeu.carte_centre)
                  // Si la carte du milieu est une * cest que cest un modele de carte "commandée"
                  parties[id].jeu.dessous_pioche.push(
                    parties[id].jeu.carte_centre
                  );
                parties[id].jeu.carte_centre = card;
                // io.in(id).emit("carte centre", parties[id].jeu.carte_centre);

                //On la retire de la main du joueur
                parties[id].users[currentUser.pseudo].cartes = parties[
                  id
                ].users[currentUser.pseudo].cartes.filter(
                  (carte) => carte != card
                );
                currentUser = parties[id].users[currentUser.pseudo];
                // socket.emit("retirer carte", card);
              }
            }
          }
        }
      }
      return { r: r, commande: commande };
    }
    function nextValue(obj, key) {
      var keys = Object.keys(obj),
        i = keys.indexOf(key);
      // if(i === -1){
      //   return null;
      // }else{
      //   if(keys.length == 1){
      //     return key;
      //   }else{
      //     if(keys[(i + 1) % Object.size(obj)]){
      //       return obj[keys[(i + 1) % Object.size(obj)]];
      //     }
      //   }
      // }
      return (
        i !== -1 &&
        keys[(i + 1) % Object.size(obj)] &&
        obj[keys[(i + 1) % Object.size(obj)]]
      );
    }
    function random(min, max) {
      if (max <= min) return min;
      else return ((parseInt(Math.random() * 1000) + min) % (max - min)) + min;
    }
  });
});

Object.size = function (obj) {
  var size = 0,
    key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

app.get("/", (req, res, next) => {
  res.send("Welcome to the express server...");
});

app.get("/", (req, res, next) => {
  res.send("Welcome to the express server...");
});

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
