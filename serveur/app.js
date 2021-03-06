var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var geoip = require("geoip-lite");
const uuidv4 = require("uuid/v4"); // <== NOW DEPRECATED!
var app = express();

require("dotenv").config();

const port = process.env.PORT || 3000
const server = app.listen(port, '0.0.0.0', () => {
    console.log("Listening on port: " + port);
});
const io = require('socket.io')(server);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
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

let avatars = [
  "001-woman-5.svg",
  "002-woman-4.svg",
  "003-woman-3.svg",
  "004-woman-2.svg",
  "005-woman-1.svg",
  "006-woman.svg",
  "007-surgeon-3.svg",
  "008-surgeon-2.svg",
  "009-surgeon-1.svg",
  "010-surgeon.svg",
  "011-doctor-3.svg",
  "012-teacher-1.svg",
  "013-teacher.svg",
  "014-police-3.svg",
  "015-police-2.svg",
  "016-police-1.svg",
  "017-police.svg",
  "018-nurse-3.svg",
  "019-nurse-2.svg",
  "020-nurse-1.svg",
  "021-nurse.svg",
  "022-captain-3.svg",
  "023-captain-2.svg",
  "024-captain-1.svg",
  "025-captain.svg",
  "026-muslim-1.svg",
  "027-muslim.svg",
  "028-arab.svg",
  "029-trinity.svg",
  "030-niobe.svg",
  "031-neo.svg",
  "032-morpheus.svg",
  "033-man-1.svg",
  "034-man.svg",
  "035-geisha.svg",
  "036-samurai.svg",
  "037-hindu-1.svg",
  "038-hindu.svg",
  "039-hipster-7.svg",
  "040-hipster-6.svg",
  "041-hipster-5.svg",
  "042-hipster-4.svg",
  "043-hipster-3.svg",
  "044-hipster-2.svg",
  "045-hipster-1.svg",
  "046-hipster.svg",
  "047-hip-hop-3.svg",
  "048-hip-hop-2.svg",
  "049-hip-hop-1.svg",
  "050-hip-hop.svg",
  "051-graduate-3.svg",
  "052-graduate-2.svg",
  "053-graduate-1.svg",
  "054-graduate.svg",
  "055-military-5.svg",
  "056-military-4.svg",
  "057-military-3.svg",
  "058-military-2.svg",
  "059-military-1.svg",
  "060-military.svg",
  "061-old-woman-1.svg",
  "062-old-woman.svg",
  "063-old-man-1.svg",
  "064-old-man.svg",
  "065-doctor-2.svg",
  "066-doctor-1.svg",
  "067-doctor-who-1.svg",
  "068-doctor-who.svg",
  "069-doctor.svg",
  "070-dancer-1.svg",
  "071-dancer.svg",
  "072-detective-3.svg",
  "073-detective-2.svg",
  "074-detective-1.svg",
  "075-detective.svg",
  "076-construction-3.svg",
  "077-construction-2.svg",
  "078-construction-1.svg",
  "079-construction.svg",
  "080-chef-3.svg",
  "081-chef-2.svg",
  "082-chef-1.svg",
  "083-chef.svg",
  "084-priest-1.svg",
  "085-priest.svg",
  "086-nun-1.svg",
  "087-nun.svg",
  "088-burglar-3.svg",
  "089-burglar-2.svg",
  "090-burglar-1.svg",
  "091-burglar.svg",
  "092-native-american-1.svg",
  "093-native-american.svg",
  "094-artist-3.svg",
  "095-artist-2.svg",
  "096-artist-1.svg",
  "097-artist.svg",
  "098-albert-einstein.svg",
  "099-african-1.svg",
  "100-african.svg",
];

const socket = require("socket.io");

var parties = {};
var tentativesUsers = {};
var browsers = {};
let bots = {};
let detectUsersInGame = {};
let botsPseudos = [
  "yvan2015",
  "pascalmir",
  "thomas",
  "malida",
  "cayla",
  "carlia",
  "Loic",
  "Atango",
  "tchoptchop",
  "lamater",
  "Nayanka20",
  "AshleyPaola",
  "PavelNgass",
  "Yvan_eye",
  "Nonodrey",
  "Kai237",
  "Merveille__",
  "Aurioma",
  "Paolaaa",
  "Lionel237",
  "Sessok",
  "Untypela",
  "Winner8",
  "Best????",
];

var mongoPassword = "CGXzx5Lcf68mSg5PMLY";
var dbase = "check_games";
var config = { mongo: { hostString: "cluster0.2rzao.mongodb.net/check_games", user: "check_games_user", db: "check_games" } };
var MongoClient = require("mongodb").MongoClient;
var url = "mongodb+srv://" + config.mongo.user + ":" + encodeURIComponent(mongoPassword) + "@" + config.mongo.hostString + "?retryWrites=true&w=majority";

/*
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

*/
MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbs) {
  if (err) {
    console.log(err);
    return false;
  }
  console.log("Connexion ?? la base de donn??es r??ussie");

  db = dbs.db(dbase);

  db.createCollection("cartes_users", function (err, res) {
    if (err) console.log(err);
  });
  db.createCollection("cartes_games", function (err, res) {
    if (err) console.log(err);
  });

  db.createCollection("cartes_games_finies", function (err, res) {
    if (err) console.log(err);
  });

  let sockets_id = {};
  let randUsers = random(2, botsPseudos.length) + Object.size(sockets_id);
  function randBotsName(id) {
    let ran,
      used = [];
    for (let bot of bots[id].users) {
      used.push(bot.pseudo);
    }
    do {
      ran = random(0, botsPseudos.length);
    } while (!used.includes(botsPseudos[ran]) && !botsPseudos[ran]);
    return botsPseudos[ran];
  }

  //  const server = app.listen(port, () => {
  //    console.log("Server started on port " + port + "...");
  //  });

  function tentativesDeReconnexion(currentUser, id) {
    if (tentativesUsers[currentUser.pseudo]) {
      if (!tentativesUsers[currentUser.pseudo].sent) {
        // On notifie tous les utilisateurs qu'un joueur est partie
        tentativesUsers[currentUser.pseudo].sent = true;
        io.in(id).emit(
          "error message",
          currentUser.pseudo +
            " s'est d??connect??(e). On tente des reconnexions."
        );
      }
      if (tentativesUsers[currentUser.pseudo].num <= 0) {
        // On supprime le joueur de la partie et on passe la main au joueur suivant

        if (
          parties[id].main == currentUser.pseudo &&
          Object.size(parties[id].users) > 1
        ) {
          parties[id].main = nextValue(
            parties[id].users,
            currentUser.pseudo
          ).pseudo; //on passe la main au joueur suivant

          // #TODO: Retirer les bots s'il en reste
        }

        delete parties[id].users[currentUser.pseudo];
        if (Object.size(parties[id].users) == 0) {
          delete parties[id];
        }
        delete tentativesUsers[currentUser.pseudo];
        io.sockets.emit("all parties", parties);
      } else {
        setTimeout(() => {
          // Au bout de 1 seconde, j'??value si une partie a toujours un joueur ?? l'??tat 0
          if (parties[id] && parties[id].users[currentUser.pseudo]) {
            if (parties[id].users[currentUser.pseudo].etat == 0) {
              tentativesUsers[currentUser.pseudo].num--;
              tentativesDeReconnexion(currentUser, id);
            } else {
              if (tentativesUsers[currentUser.pseudo].sent === true) {
                // On notifie tous les utilisateurs qu'un joueur est partie
                tentativesUsers[currentUser.pseudo].sent = true;
                io.in(id).emit(
                  "error message",
                  currentUser.pseudo + " est revenu(e) ????."
                );
              }
              delete tentativesUsers[currentUser.pseudo];
            }
          }
        }, 1000);
      }
    }
  }

  function addBotTrigger(id) {
    detectUsersInGame[id] = {};
    detectUsersInGame[id].timeout = setTimeout(() => {
      if (parties[id] && Object.size(parties[id].users) <= 2) {
        for (let i = 0; i < random(1, 5); i++) {
          addBots(id, 1); // On ajoute le premier bot
        }
      }
    }, random(5, 20) * 100);
  }

  function addBots(id, total) {
    setTimeout(() => {
      if (parties[id] && parties[id].etat < 2) {
        if (!bots[id]) {
          bots[id] = {};
          bots[id].id = id;
        }
        if (!bots[id].users) {
          bots[id].users = [];
        }
        let partie = parties[id];
        let b;
        for (let i = 0; i < total; i++) {
          b = {
            index: bots[id].users.length,
            cartes: [],
            etat: 2,
            pseudo: randBotsName(id),
            points: 0,
            profile: "bot",
            difficulte: 0,
          };
          bots[id].users.push(b);
          partie.users[b.pseudo] = b;
          console.log(
            b.pseudo + " a rejoint la partie cr????e par " + partie.admin.pseudo
          );
        }
        io.in(id).emit("partie", partie);
        // On ajoute les bots ?? la liste des joueurs connect??s
        sockets_id[id + b.pseudo] = { user: b, socket: b.index };
        io.sockets.emit(
          "users connected",
          randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
        );
      }
    }, random(5, 30) * 100);
  }

  
  function escapeHtml(unsafe) {
  return unsafe
    .replace(".", "")
    .replace(" ", "")
    .replace(",", "")
    .replace(/&/g, "")
    .replace(/</g, "")
    .replace(/>/g, "")
    .replace(/"/g, "")
    .replace(/'/g, "");
}
  io.sockets.on("connection", (socket) => {
    let currentUser = {};
    let partie = {};
    randUsers = random(2, botsPseudos.length) + Object.size(sockets_id);
    let ip = socket.handshake.address;
    let geo = geoip.lookup(ip);

    // Connexion d'un utilisateur
    socket.on("connexion", (user, browserid = 0, verif = false) => {
      user.geo = geo;
      user.pseudo = escapeHtml(user.pseudo)
      // console.log("Connexion d'un utilisateur ", user, sockets_id);
      if (sockets_id[user.pseudo]) {
        if (browsers[user.pseudo].id === browserid && verif) {
          // On d??connecte l'ancien et on relance ici
          if (io.sockets.connected[sockets_id[user.pseudo].socket])
            io.sockets.connected[sockets_id[user.pseudo].socket].disconnect();
          user.points = 0;
          user.etat = false;
          currentUser = user;
          sockets_id[user.pseudo] = { user: user, socket: socket.id };
          browsers[user.pseudo] = { id: Object.size(browsers) + 1 };
          socket.emit("user saved", user, browsers[user.pseudo].id);
        } else {
          socket.emit("user already saved", user);
        }
      } else {
        user.points = 0;
        user.etat = false;
        currentUser = user;
        sockets_id[user.pseudo] = { user: user, socket: socket.id };
        browsers[user.pseudo] = { id: Object.size(browsers) + 1 };
        socket.emit("user saved", user, browsers[user.pseudo].id);
      }
    });

    socket.on("users connected", () => {
      socket.emit(
        "users connected",
        // randUsers 
        // + "<sub>" +
         Object.size(sockets_id) 
        //  + "</sub>"
      );
    });

    socket.on("parties en cours", () => {
      socket.emit(
        "parties en cours",
        // parseInt(randUsers / 3) +
        //   Object.size(parties) +
        //   "<sub>" +
          Object.size(parties)
          //  + "</sub>"
      );
    });

    socket.on("get browser id", (user) => {
      if (!browsers[user.pseudo]) {
        browsers[user.pseudo] = { id: Object.size(browsers) + 1 };
      }
      socket.emit("browser id", browsers[user.pseudo].id);
    });

    // Nouvelle partie
    socket.on("new game", (user, code = false) => {
      user.etat = 1;
      partie = {};
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
      if (code) {
        console.log("partie cr????e avec un code");
        partie.code = code;
      }
      // partie.messages.push({
      //   text: "Je viens de cr??er une partie",
      //   sender: user,
      //   date: new Date(),
      // });
      parties[partie.id] = partie;
      if (!partie.code) {
        // Quand on cr??e la partie, on lance le detecteur d'utilisateur dans le jeu
        addBotTrigger(partie.id);
      }

      socket.join(partie.id);
      console.log("Nouvelle partie", partie);
      io.in(partie.id).emit("join", partie);
      // console.log("broadcast new game", parties)
      let datas = {};
      for (let id in parties) {
        if (parties[id].etat < 2) datas[id] = parties[id];
      }
      io.sockets.emit("all parties", datas);
      io.sockets.emit(
        "users connected",
        randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
      );
      io.sockets.emit(
        "parties en cours",
        parseInt(randUsers / 3) +
          Object.size(parties) +
          "<sub>" +
          Object.size(parties) +
          "</sub>"
      );
      //  io.sockets.emit("error message", "Il y a actuellement "+Object.size(parties)+" parties en cours")

      // socket.emit("")
    });

    // Get all parties
    socket.on("all parties", () => {
      // socket.emit("error message", "Il y a actuellement "+Object.size(parties)+" parties en cours")
      let datas = {};
      for (let id in parties) {
        if (parties[id].etat < 2) datas[id] = parties[id];
      }
      // console.log("parties en cours", datas);
      socket.emit("all parties", datas);
    });

    // 'lancer event'
    socket.on("lancer", (id) => {
      if (parties[id]) {
        partie = parties[id];
        for (let pseudo in partie.users) {
          partie.users[pseudo].etat = 2;
        }
        // Partie effectivemnt lanc??e par l'admin
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
        // console.log("lancement de la partie");
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
      io.sockets.emit(
        "users connected",
        randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
      );
      io.sockets.emit(
        "parties en cours",
        parseInt(randUsers / 3) +
          Object.size(parties) +
          "<sub>" +
          Object.size(parties) +
          "</sub>"
      );
    });

    /** */
    socket.on("pique", (id) => {
      partie = parties[id];
      currentUser = partie.users[currentUser.pseudo];
      // console.log(currentUser, "doit piocher normalement", partie);
      if (currentUser.pioche && currentUser.pseudo == partie.main) {
        io.in(id).emit(
          "notification",
          currentUser.pseudo +
            " prend " +
            currentUser.pioche +
            " cartes suppl??mentaires"
        );
        io.in(id).emit(
          "error message",
          currentUser.pseudo +
            " prend " +
            currentUser.pioche +
            " cartes suppl??mentaires"
        );

        for (let i = 0; i < currentUser.pioche; i++) {
          piocher(id, currentUser.pseudo); // On pioche autant de fois que necessaire
          // console.log("pioche n??", i);
        }
        delete parties[id].users[currentUser.pseudo].pioche; // on supprime la pioche
        currentUser = parties[id].users[currentUser.pseudo]; // on met ?? jour l'utilisateur
        partie = parties[id];
        //On passe la main au joueur suivant
        partie.jeu.tour++;
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        io.in(id).emit("partie", partie);
        setTimeout(() => {
          botWantToPlay(id);
        }, random(10, 50) * 100);
      }
    });

    /** Un joueur souhaite piocher */
    socket.on("pioche", function (id) {
      if (currentUser.pseudo == parties[id].main) {
        piocher(id, currentUser.pseudo);
        partie = parties[id]; // On met ?? jour la partie du joueur
        //On passe la main au joueur suivant
        partie.jeu.tour++;
        let allUsers = Object.keys(partie.users);
        partie.jeu.tour %= allUsers.length;
        partie.main = allUsers[partie.jeu.tour];
        parties[id] = partie;
        io.in(id).emit("partie", partie);
        setTimeout(() => {
          botWantToPlay(id);
        }, random(10, 50) * 100);
        // io.in(id).emit("tour", id, sessions[id].participants[parties[id].tour]);
      } else {
        socket.emit("pas ton tour");
        // console.log(
        //   currentUser.pseudo + " a voulu jouer alors que cetait pas son tour."
        // );
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
            // On met ?? jour les cartes
            // Si la partie est finie,
            if (currentUser.cartes.length == 0) {
              // Fin de la partie
              partie = parties[id];
              parties[id].etat = 3;
              parties[id].gagnant = currentUser.pseudo;
              io.in(id).emit("partie", partie);
              // partie = parties[id];
              // io.in(id).emit("partie", parties[id]);
              // On supprime la partie qui est termin??e
              parties[id].endtime = new Date();
              db.collection("cartes_games_finies").insertOne(parties[id]);
              // parties_finies[id] = parties[id];
              delete parties[id];
              // On supprime les bots ?? la liste des joueurs connect??s
              if (bots[id]) {
                for (let b of bots[id].users) {
                  delete sockets_id[id + b.pseudo];
                }
              }
              delete bots[id]; // On supprime le tableau des bots en rapport avec la partie
              io.sockets.emit(
                "users connected",
                randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
              );
            } else {
              if (currentUser.cartes.length == 1) {
                io.in(id).emit(
                  "notification",
                  currentUser.pseudo + " annonce 'CHECK !' "
                );
                // Le joueur annonce check
                // partie.messages.push({
                //   text: "CHECK",
                //   sender: currentUser,
                //   date: new Date(),
                // });
              }
              partie = parties[id];
              io.in(id).emit("partie", partie);
              if (commande) {
                //Le J commande, donc le joueur doit choisir la carte qu'il commande
                socket.emit("commande");
              }
              setTimeout(() => {
                botWantToPlay(id);
              }, random(10, 50) * 100);
            }
            // On definit le timer pour le joueur suivant
            // if (parties[id].timer) {
            //   clearTimeout(parties[id].timer);
            // }
            // parties[id].timer = setTimeout(bouffeAuto,waitingTime,parties[id].main,id);
          } else {
          }
        } else {
          socket.emit("pas ton tour");
          console.log(
            currentUser.pseudo + " a voulu jouer alors que cetait pas son tour."
          );
        }
      } catch (err) {
        // console.log(err);
        console.log(
          "une erreur est survenue dans la partie ",
          parties[id],
          err
        );
        socket.emit("reset", id, err);
      }
    });

    socket.on("remove player", (joueur, id) => {
      if (parties[id] && parties[id].users[joueur]) {
        parties[id].jeu.dessous_pioche.concat(parties[id].users[joueur].cartes); // on met ses cartes dans la pioche
        if (parties[id].main == joueur) {
          parties[id].main = nextValue(parties[id].users, joueur).pseudo; //on passe la main au joueur suivant
        }
        delete parties[id].users[joueur];
        if (sockets_id[joueur] && io.sockets.connected[sockets_id[joueur].socket])
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
      io.sockets.emit(
        "users connected",
        randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
      );
      io.sockets.emit(
        "parties en cours",
        parseInt(randUsers / 3) +
          Object.size(parties) +
          "<sub>" +
          Object.size(parties) +
          "</sub>"
      );
    });

    // function bouffeAuto(joueur, id) {
    //   io.in(id).emit("error message", "Bouffe auto pour " + joueur);
    //   // Au bout du delai, je fais bouffer automatiquement et je passe la main
    //   console.log("Bouffe Auto");
    //   console.log(parties[id]);
    //   piocher(id, joueur); // On pioche autant de fois que necessaire
    //   parties[id].users[joueur].autoPlay++; // on met ?? jour l'utilisateur
    //   if (parties[id].users[joueur].autoPlay > 2) {
    //     // 2 jeux automatiques, on sort le joueur
    //     parties[id].jeu.dessous_pioche.push(parties[id].users[joueur].cartes); // on met ses cartes dans la pioche
    //     delete parties[id].users[joueur];
    //   }
    //   let partie = parties[id];
    //   console.log(partie);
    //   //On passe la main au joueur suivant
    //   partie.jeu.tour++;
    //   let allUsers = Object.keys(partie.users);
    //   partie.jeu.tour %= allUsers.length;
    //   partie.main = allUsers[partie.jeu.tour];
    //   parties[id] = partie;
    //   io.in(id).emit("partie", partie);

    //   // On definit le timer pour le joueur suivant
    //   if (parties[id].timer) {
    //     clearTimeout(parties[id].timer);
    //   }
    //   parties[id].timer = setTimeout(
    //     bouffeAuto,
    //     waitingTime,
    //     parties[id].main,
    //     id
    //   );
    // }

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
        io.in(id).emit("notification", currentUser.pseudo + " a command??  ");
        io.in(id).emit("partie", partie);
        setTimeout(() => {
          botWantToPlay(id);
        }, random(10, 30) * 100);
      } catch (err) {
        // console.log(err);
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
          // On s'assure que l'utilisateur n'??tait pas deja inscrit ?? la partie
          let dejala = false;
          if (partie.users[currentUser.pseudo]) dejala = true;

          if (!dejala) {
            if (parties[id].etat < 2) {
              // si la partie n'a pas encore ??t?? lanc??e
              // si l'utilisateur n'est pas encore inscrit (premiere fois)
              socket.join(id);
              currentUser.etat = 1;
              partie.users[currentUser.pseudo] = currentUser;
              // On parcours pour voir si l'admin est un robot. Ou si l'admin est pr??sent ou pas.
              let adminpresent = false;
              if (!currentUser.profile) {
                if (partie.admin.profile) {
                  //si cest un robot qui est admin, on met l'utilisateur actuel
                  partie.admin = currentUser;
                } else {
                  // On v??rifie donc si l'admin est encore dans la partie
                  for (let pseudo in partie.users) {
                    if (partie.admin.pseudo == pseudo) {
                      adminpresent = true;
                    }
                  }
                  if (!adminpresent) {
                    partie.admin = currentUser;
                  }
                }
              }
              // partie.messages.push(message);
              io.in(partie.id).emit("join", partie);
              io.in(partie.id).emit("partie", partie);
              io.in(partie.id).emit("new message", message);
              console.log(currentUser.pseudo + " a rejoint une partie", partie);
              parties[id] = partie;
            } else {
              // la partie a d??j?? d??but??
              socket.emit("error message", "partie d??j?? lanc??e");
              socket.emit("in game", id, parties[id].etat);
            }
          } else {
            if (parties[id].etat == 3) {
              currentUser.etat = 0;
              socket.leave(id);
            } else {
              socket.join(id);
              // L'utilisateur vient de se reconnecter, on remet son etat ?? 1
              for (let pseudo in partie.users) {
                if (!partie.users[pseudo]) {
                  // Si le champ pseudo manque, on supprime cet utilisateur
                  delete partie.users[pseudo];
                } else {
                  partie.users[pseudo].etat = 1;
                }
              }
              // On parcours pour voir si l'admin est un robot. Ou si l'admin est pr??sent ou pas.
              let adminpresent = false;
              if (!currentUser.profile) {
                if (partie.admin.profile) {
                  //si cest un robot qui est admin, on met l'utilisateur actuel
                  partie.admin = currentUser;
                } else {
                  // On v??rifie donc si l'admin est encore dans la partie
                  for (let pseudo in partie.users) {
                    if (partie.admin.pseudo == pseudo) {
                      adminpresent = true;
                    }
                  }
                  if (!adminpresent) {
                    partie.admin = currentUser;
                  }
                }
              }
              parties[id] = partie;
              io.in(partie.id).emit("join", partie);
              io.in(partie.id).emit("partie", partie);
              // console.log(currentUser.pseudo + " ??tait deja l??");
            }
          }
        }
      } else {
        socket.emit("error message", "Cette partie n'est pas disponible");
        socket.emit("nogame", id);
      }
      let datas = {};
      for (let id in parties) {
        if (parties[id].etat < 2) datas[id] = parties[id];
      }
      io.sockets.emit("all parties", datas);
      io.sockets.emit(
        "users connected",
        randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
      );
      io.sockets.emit(
        "parties en cours",
        parseInt(randUsers / 3) +
          Object.size(parties) +
          "<sub>" +
          Object.size(parties) +
          "</sub>"
      );
    });

    socket.on("quit", (id) => {
      if (parties[id]) {
        console.log("current user : "+currentUser.pseudo +" quitte la partie")
        partie = parties[id];
        if (partie.etat >= 2) {
          if (parties[id].jeu.dessous_pioche) {
            parties[id].jeu.dessous_pioche.concat(
              parties[id].users[currentUser.pseudo].cartes
            ); // on met ses cartes dans la pioche
          }
        }
        if (
          partie.main == currentUser.pseudo &&
          Object.size(partie.users) > 1
        ) {
          partie.main = nextValue(partie.users, currentUser.pseudo).pseudo; //on passe la main au joueur suivant
        }

        if (
          partie.admin.pseudo == currentUser.pseudo &&
          Object.size(partie.users) > 1
        ) {
          let ic = 0;
          let suivant = currentUser;
          do {
            // si cest lui l'admin, on passe au joueur suivant (s'il yen a un) sauf aux bots
            suivant = nextValue(partie.users, suivant.pseudo);
            console.log("suivant", suivant)
            ic++;
          } while (
            suivant 
            && suivant.profile && suivant.profile == "bot" &&
            ic < Object.size(partie.users)
          );
          if (suivant.pseudo != currentUser.pseudo) {
            partie.admin = partie.users[suivant.pseudo];
          }
        }
        // console.log(
        //   "l'admin est sortie de la partie. Il reste ",
        //   Object.size(partie.users),
        //   "joueurs"
        // );
        delete partie.users[currentUser.pseudo];

        currentUser.etat = 0;
        parties[id] = partie;
        partie = {};

        let usersLeft = 0
        for(let pseudo of Object.keys(parties[id].users)){
          if(parties[id].users[pseudo] && !parties[id].users[pseudo].profile){
            usersLeft++;
          }
        }

        console.log("usersLeft", usersLeft);

        if (usersLeft === 0 || !parties[id].admin) {
          // S'il n'y a plus de joueurs dans la partie, on supprime la partie
          delete parties[id];
          if (bots[id] && bots[id].users) {
            // On supprime les bots ?? la liste des joueurs connect??s
            for (let b of bots[id].users) {
              if (sockets_id[id + b.pseudo]) delete sockets_id[id + b.pseudo];
            }
            delete bots[id]; // On supprime le tableau des bots en rapport avec la partie
          }
        }
        io.in(id).emit("partie", parties[id]);
      }
      socket.leave(id);
      let datas = {};
      for (let id in parties) {
        if (parties[id].etat < 2) datas[id] = parties[id];
      }

      // console.log(currentUser.pseudo, "a quitt?? la partie. Parties : ", datas);
      io.sockets.emit("all parties", datas);
      io.sockets.emit(
        "users connected",
        randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
      );
      io.sockets.emit(
        "parties en cours",
        parseInt(randUsers / 3) +
          Object.size(parties) +
          "<sub>" +
          Object.size(parties) +
          "</sub>"
      );
    });

    socket.on("disconnect", () => {
      if (sockets_id[currentUser.pseudo]) {
        delete sockets_id[currentUser.pseudo];
      }
      if (partie && partie.id && parties[partie.id]) {
        // En cas de d??connexion, l'utilisateur passe ?? l'??tat 0 et on lance une tentative de reconnexion
        for (let i in partie.users) {
          if (partie.users[i].pseudo === currentUser.pseudo) {
            partie.users[i].etat = 0;
          }
        }
        io.in(partie.id).emit("partie", partie);
        socket.emit("deconnexion");
        if (partie.id) {
          tentativesUsers[currentUser.pseudo] = {};
          tentativesUsers[currentUser.pseudo].num = 60;
          tentativesDeReconnexion(currentUser, partie.id);
        }
        let datas = {};
        for (let id in parties) {
          if (parties[id].etat < 2) datas[id] = parties[id];
        }
        io.sockets.emit("all parties", datas);
        io.sockets.emit(
          "users connected",
          randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
        );
        io.sockets.emit(
          "parties en cours",
          parseInt(randUsers / 3) +
            Object.size(parties) +
            "<sub>" +
            Object.size(parties) +
            "</sub>"
        );
        // parties[partie.id].users.remove(currentUser);
      }
    });

    function distribution(id) {
      var n = 4;
      //Distribution de n cartes au debut
      for (let user of Object.keys(partie.users)) {
        for (var j = 0; j < n; j++) {
          if (partie.users[user].cartes) {
            piocher(id, user);
          }
        }
      }
      //tableau (carte du milieu)
      do {
        do {
          var ran = random(0, partie.jeu.pioche.length);
          // console.log("ran", ran);
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

    function piocher(id, pseudo, distrib = 0) {
      // if (partie.jeu.pioche_vide) {
      //   partie.jeu.pioche = partie.jeu.dessous_pioche;
      //   partie.jeu.dessous_pioche = [];
      //   partie.jeu.pioche_vide = 0;
      //   console.log("Vous ne pouviez plus piocher");
      // }
      partie = parties[id];
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
        //   "Partie n??" +
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
            io.sockets.emit("error message", "La pioche est vide");
            partie.jeu.pioche_vide = 1;
          }
        }
        parties[id] = partie;
      } else {
        console.log("Vous ne pouvez plus piocher");
        io.sockets.emit(
          "error message",
          "Vous ne pouvez plus piocher de carte"
        );
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
      let currentUser = parties[id].users[nom];
      // console.log(motif + " <> " + motif_centre);
      // console.log(num + " <> " + num_centre);

      let r = 0,        commande = false;

      if (num == "2") {
        //Le  num??ro de la carte jou??e est 2 (passe partout)
        r = 1;
        if (card != null) parties[id].jeu.dessous_pioche.push(card); //En dessous du centre on met la carte 2 l??

        //On la retire de la main du joueur
        parties[id].users[currentUser.pseudo].cartes = parties[id].users[
          currentUser.pseudo
        ].cartes.filter((carte) => carte != card);
        currentUser = parties[id].users[currentUser.pseudo];
        socket.emit("retirer carte", card);
      } else {
        if (num == "J") {
          //Lorsquil commande, le motif devient le motif quil a command?? et le numero devient une etoile

          //On la met sur la table
          if (num_centre != "*" && parties[id].carte_centre != null)
            // Si la carte du milieu est une * cest que cest un modele de carte "command??e"
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
                // Si la carte du milieu est une * cest que cest un modele de carte "command??e"
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
                // console.log(
                //   nom +
                //     " dans la partie cr????e par " +
                //     parties[id].admin.pseudo +
                //     " a jou?? " +
                //     card +
                //     " et " +
                //     suivant.pseudo +
                //     " doit piocher " +
                //     nombre_de_cartes_a_piocher +
                //     " cartes suppl??mentaires."
                // );

                // io.in(id).emit(
                //   "pioche double",
                //   suivant,
                //   nombre_de_cartes_a_piocher
                // );

                //On la met sur la table
                if (num_centre != "*" && parties[id].jeu.carte_centre)
                  // Si la carte du milieu est une * cest que cest un modele de carte "command??e"
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
                partie = parties[id];//les 4 lignes du bas ont ??t?? copi??es j'ai eu la flemme de changer en parties[id] partout, du coup j'ajoute cette ligne
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
                // console.log(
                //   nom +
                //     " dans la partie cr????e par " +
                //     parties[id].admin.pseudo +
                //     " a jou?? " +
                //     card
                // );
                //si la carte propos??e correspond aux criteres, alors elle est jou??e.

                //On la met sur la table
                if (num_centre != "*" && parties[id].jeu.carte_centre)
                  // Si la carte du milieu est une * cest que cest un modele de carte "command??e"
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
                // console.log(
                //   "les cartes qui restent ",
                //   card,
                //   currentUser.cartes
                // );
                // let suivant = nextValue(parties[id].users, nom);
                // console.log("c'est le tour de ", suivant);
                // socket.emit("retirer carte", card);
              }
            }
          }
        }
      }
      return { r: r, commande: commande };
    }

    function botPlayACard(index, id, carte_centre) {
      let motif_centre = carte_centre.split("")[
          carte_centre.split("").length - 1
        ],
        num_centre = carte_centre.substring(
          0,
          carte_centre.length - motif_centre.length
        );
      if (parties[id]) {
        let currentUser = parties[id].users[bots[id].users[index].pseudo];

        if (bots[id].users[index].difficulte === 0) {
          if (parties[id].users[bots[id].users[index].pseudo].pioche) {
            // Si le bot doit piocher, je regarde s'il a un 7
            let c = currentUser.cartes.filter((carte) => {
              let motif = carte
                .split("")
                [carte.split("").length - 1].toLowerCase();
              let num = carte.substring(0, carte.length - motif.length);
              return num == num_centre;
            });
            if (c.length > 0) {
              return c[0];
            } else {
              return null;
            }
          }
          // On cherche le premier motif
          let c = currentUser.cartes.filter((carte) => {
            let motif = carte
              .split("")
              [carte.split("").length - 1].toLowerCase();
            return motif == motif_centre;
          });
          // console.log("carte que le bot doit jouer motif", c);
          if (c.length > 0) {
            return c[0];
          } else {
            // On cherche le premier numero
            let c = currentUser.cartes.filter((carte) => {
              let motif = carte
                .split("")
                [carte.split("").length - 1].toLowerCase();
              let num = carte.substring(0, carte.length - motif.length);
              return num == num_centre;
            });
            // console.log("carte que le bot doit jouer chiffre", c);
            if (c.length > 0) {
              return c[0];
            } else {
              // On check s'il a un 2
              let c = currentUser.cartes.filter((carte) => {
                let motif = carte
                  .split("")
                  [carte.split("").length - 1].toLowerCase();
                let num = carte.substring(0, carte.length - motif.length);
                return num == "2";
              });
              // console.log("carte que le bot doit jouer chiffre", c);
              if (c.length > 0) {
                return c[0];
              } else {
                // On check s'il a un J
                let c = currentUser.cartes.filter((carte) => {
                  let motif = carte
                    .split("")
                    [carte.split("").length - 1].toLowerCase();
                  let num = carte.substring(0, carte.length - motif.length);
                  return num == "J";
                });
                // console.log("carte que le bot doit jouer chiffre", c);
                if (c.length > 0) {
                  return c[0];
                } else {
                  return null;
                }
              }
            }
          }
        }
      }
    }

    function botWantToPlay(id) {
      let userBot = { pseudo: "" };
      if (parties[id] && bots[id]) {
        for (let bot of bots[id].users) {
          if (parties[id].main == bot.pseudo) {
            userBot = bot;
          }
        }
        if (parties[id].main == userBot.pseudo) {
          let currentUser = parties[id].users[userBot.pseudo];
          let motif_centre = parties[id].jeu.carte_centre.split("")[
              parties[id].jeu.carte_centre.split("").length - 1
            ],
            num_centre = parties[id].jeu.carte_centre.substring(
              0,
              parties[id].jeu.carte_centre.length - motif_centre.length
            );
          console.log(
            "cest au tour du bot " +
              userBot.pseudo +
              " partie cr????e par " +
              parties[id].admin.pseudo
          );
          let cardPlayed = botPlayACard(
            userBot.index,
            id,
            parties[id].jeu.carte_centre
          );
          console.log(
            "le bot " + currentUser.pseudo + " a tente de jouer " + cardPlayed
          );
          if (cardPlayed) {
            let { r, commande } = jouer(id, currentUser.pseudo, cardPlayed);
            console.log("r bot", r, "command bot", commande);
            if (r>0) {
              //On passe la main au joueur suivant
              let partie = parties[id];
              partie.jeu.tour += r;
              let allUsers = Object.keys(partie.users);
              partie.jeu.tour %= allUsers.length;
              partie.main = allUsers[partie.jeu.tour];
              parties[id] = partie;
              currentUser = parties[id].users[currentUser.pseudo];
              console.log(
                "les cartes qu'il reste au bot r ",
                currentUser.cartes
              );
              // On met ?? jour les cartes
              // Si la partie est finie,
              if (currentUser.cartes.length == 0) {
                // Fin de la partie
                partie = parties[id];
                parties[id].etat = 3;
                parties[id].gagnant = currentUser.pseudo;
                io.in(id).emit("partie", partie);
                // On supprime la partie qui est termin??e
                parties[id].endtime = new Date();

                db.collection("cartes_games_finies").insertOne(parties[id]);
                // parties_finies[id] = parties[id];
                delete parties[id];

                // On supprime les bots ?? la liste des joueurs connect??s
                for (let b of bots[id].users) {
                  delete sockets_id[id + b.pseudo];
                }
                delete bots[id]; // On supprime le tableau des bots en rapport avec la partie
                io.sockets.emit(
                  "users connected",
                  randUsers + "<sub>" + Object.size(sockets_id) + "</sub>"
                );

                return;
              } else {
                if (currentUser.cartes.length == 1) {
                  io.in(id).emit(
                    "notification",
                    currentUser.pseudo + " annonce 'CHECK !' "
                  );
                }
                partie = parties[id];
                io.in(id).emit("partie", partie);
              }
              // if (r === 2 && Object.size(parties[id].users) === 2) {
                setTimeout(() => {
                  botWantToPlay(id);
                }, random(10, 30) * 100);
              // }
            } else {
              if (currentUser.cartes.length == 0) {
                // Fin de la partie
                partie = parties[id];
                parties[id].etat = 3;
                parties[id].gagnant = currentUser.pseudo;
                io.in(id).emit("partie", partie);
                // On supprime la partie qui est termin??e
                parties[id].endtime = new Date();

                db.collection("cartes_games_finies").insertOne(parties[id]);
                // parties_finies[id] = parties[id];
                delete parties[id];
                return;
              } else {
                if (currentUser.cartes.length == 1) {
                  io.in(id).emit(
                    "notification",
                    currentUser.pseudo + " annonce 'CHECK !' "
                  );
                }
                // partie = parties[id];
                // io.in(id).emit("partie", partie);
              }
              if (commande) {
                io.in(id).emit("partie", partie);
                setTimeout(() => {
                  botWantToCommand(userBot.index, id);
                }, random(10, 30) * 100);
              } else {
                if (r === 0) {
                  setTimeout(() => {
                    botWantToPlay(id);
                  }, random(10, 30) * 100);
                }
              }
            }
          } else {
            // si le bot ne peut pas jouer, il pioche
            botPioche(userBot.index, id);
            
            //Lorsqu'un robot a jou??, il appelle la fonction au cas o?? un autre robot doit jouer
            setTimeout(() => {
              botWantToPlay(id);
            }, random(10, 30) * 100);
          }
        }
      }
    }

    function botPioche(index, id) {
      if (parties[id]) {
        let currentUser = parties[id].users[bots[id].users[index].pseudo];
        if (currentUser.pseudo == parties[id].main) {
          if (currentUser.pioche) {
            console.log("le bot doit piquer beaucoup de cartes");
            botHasToPickSomeCards(index, id);
          } else {
            console.log("le bot doit juste piocher une carte");
            piocher(id, currentUser.pseudo);
            let partie = parties[id]; // On met ?? jour la partie du joueur
            //On passe la main au joueur suivant
            partie.jeu.tour++;
            let allUsers = Object.keys(partie.users);
            partie.jeu.tour %= allUsers.length;
            partie.main = allUsers[partie.jeu.tour];
            parties[id] = partie;
            console.log(
              "update de la partie, cartes apres pioche",
              partie.users[currentUser.pseudo].cartes
            );
            io.in(id).emit("partie", partie);
            // io.in(id).emit("tour", id, sessions[id].participants[parties[id].tour]);
          }
        }
      }
    }

    function botWantToCommand(index, id) {
      //on regarde dans les cartes du robot le motif qui revient le plus
      let motifs = {};
      motifs["s"] = 0;
      motifs["c"] = 0;
      motifs["h"] = 0;
      motifs["d"] = 0;
      let max = 0,
        maxmotif = null;
      if (parties[id]) {
        bots[id].users[index].cartes.forEach((carte) => {
          let motif = carte.split("")[carte.split("").length - 1].toLowerCase();
          motifs[motif]++;
          if (motifs[motif] > max) {
            max = motifs[motif];
            maxmotif = motif;
          }
        });
        if (maxmotif) {
          let carte = "*" + maxmotif;
          let partie = parties[id];
          partie.jeu.carte_centre = carte;
          partie.jeu.tour++;
          let allUsers = Object.keys(partie.users);
          partie.jeu.tour %= allUsers.length;
          partie.main = allUsers[partie.jeu.tour];
          parties[id] = partie;
          io.in(id).emit(
            "notification",
            bots[id].users[index].pseudo + " a command??  "
          );
          io.in(id).emit("partie", partie);
          
          //Lorsqu'un robot a jou??, il appelle la fonction au cas o?? un autre robot doit jouer
          setTimeout(() => {
            botWantToPlay(id);
          }, random(10, 30) * 100);
        }
      }
    }

    function botHasToPickSomeCards(index, id) {
      let partie = parties[id];
      if (parties[id]) {
        let currentUser = partie.users[bots[id].users[index].pseudo];
        console.log(currentUser.pseudo, "doit piocher normalement", partie);
        if (currentUser.pioche && currentUser.pseudo == partie.main) {
          io.in(id).emit(
            "notification",
            currentUser.pseudo +
              " prend " +
              currentUser.pioche +
              " cartes suppl??mentaires"
          );
          io.in(id).emit(
            "error message",
            currentUser.pseudo +
              " prend " +
              currentUser.pioche +
              " cartes suppl??mentaires"
          );

          for (let i = 0; i < currentUser.pioche; i++) {
            piocher(id, currentUser.pseudo); // On pioche autant de fois que necessaire
            console.log("pioche n??", i);
          }
          delete parties[id].users[currentUser.pseudo].pioche; // on supprime la pioche
          currentUser = parties[id].users[currentUser.pseudo]; // on met ?? jour l'utilisateur
          partie = parties[id];
          //On passe la main au joueur suivant
          partie.jeu.tour++;
          let allUsers = Object.keys(partie.users);
          partie.jeu.tour %= allUsers.length;
          partie.main = allUsers[partie.jeu.tour];
          parties[id] = partie;
          io.in(id).emit("partie", partie);
        }
      }
    }
  });
});

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

app.get("/lamater", (req, res, next) => {
  MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbs) {
    if (err) {
      console.log(err);
      return false;
    }
    console.log("Connexion ?? la base de donn??es r??ussie");

    db = dbs.db(dbase);

    db.collection("cartes_games_finies")
      .find({})
      .toArray(function (err, result) {
        res.render("index", {
          title: "Dashboard",
          parties: result,
        });
      });
  });
});

app.get("/lamater/parties", (req, res, next)=>{
   MongoClient.connect(url, { useNewUrlParser: true }, function (err, dbs) {
     if (err) {
       console.log(err);
       return false;
     }
     console.log("Connexion ?? la base de donn??es r??ussie");

     db = dbs.db(dbase);

     db.collection("cartes_games_finies").find({}).toArray(function (err, result) {
         res.send(result)
      });
   });
})
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
