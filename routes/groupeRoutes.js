const express = require("express");
const Groupe = require("../modele/Groupe");
const User = require("../modele/User");
const Transaction = require("../modele/Transaction");
const async = require("async");

var router = express.Router();


router.route("/groupeRoutes/addingGroupe")
    .post((req, res)=>{
            User.model.findById(req.body.user.id).then((user)=>{

                const groupe = new Groupe.model();
                    groupe.title = req.body.groupe.title;
                    groupe.users.push({total: 0, user:user});
                    groupe.total = 0;
                groupe.save();
        
                return res.json({success:true, groupe:groupe});
            }).catch((err)=>{
                return res.json({success:false, err:err});
            });
    });


router.route("/groupeRoutes/addingTransaction")
    .post((req, res)=>{
        
        async.waterfall([
            function (callback){
                //Recherche de l'utilisateur pour l'ajouter à la transaction.
                User.model.findById({_id:req.body.user.id}).then((user)=>{
                    callback(null, user);
                })
            },
            
            function(user, callback){
                // Ajout de la transaction
                const transactionP = new Transaction.model();
                    transactionP.title = req.body.transaction.title;
                    transactionP.amount = req.body.transaction.amount;
                    transactionP.user = user;
                callback(null, transactionP);
            },

            function(transaction, callback){

                //Recuperation du groupe dans lequel va se faire la transaction.
                Groupe.model.findOne({_id:req.body.groupe.id}).then((groupe)=>{
                    callback(null, groupe, transaction);
                })
            },

            function(groupe, transaction, callback){
                //Ajout de la transaction au groupe
                groupe.transaction.push(transaction);
                groupe.total += transaction.amount;

                // Mise à jour du total de dépense de l'utilisateur pour le groupe.
                for (const user of groupe.users) {
                    if(user.user.id == req.body.user.id){
                        user.total += req.body.transaction.amount;
                    }
                }
                callback(null, groupe);
            },

            function(groupe, callback){

                // Permet de préparer le calcul pour chaque utilisateur du groupe qui sont en dessous de ce qu'ils ont à payer.

                // TODO: faire en sorte d'update la dette au lieu de créer un nouveau fichier avec les memes infos où l'amount differe.
                // Met à jour les dettes.
                const nbPersonneGroupe = groupe.users.length;
                const total = groupe.total;

                const tabUtilQuiDoiventRembouser = [];
                const tabUtilAuDessusDeMoyenne = [];

                const moyenneApayer = total/nbPersonneGroupe;

                for (const userG of groupe.users) {
                    if(userG.total>moyenneApayer){
                        tabUtilAuDessusDeMoyenne.push(userG);
                    }
                    if(userG.total<moyenneApayer){
                        tabUtilQuiDoiventRembouser.push(userG);
                    }
                }

                const nbUserEnDessous = tabUtilQuiDoiventRembouser.length;

                for (const userM of tabUtilQuiDoiventRembouser) {

                    for (const userP of tabUtilAuDessusDeMoyenne ) {
                        
                        const result = calculRemboursement(userP.total, total, nbUserEnDessous, userM.total, moyenneApayer);
                        const tab = {userQuiAMoinsPaye: userM.user, amount: result, userArembourser: userP.user};
                        
                        if(groupe.refunder.length == 0){
                            console.log("par ici");
                            groupe.refunder.push(tab);
                        }else{
                            for (var userRefunder of groupe.refunder) {

                                if(userRefunder.userQuiAMoinsPaye.id == userM.user.id){
                                    Object.assign(userRefunder,tab);
                                }else{
                                    groupe.refunder.push(tab);
                                }
                            }
                        }
                    }        
                }
                groupe.save();
                callback(null, groupe);
            }

        ],function(err, result){
            if(err){
                console.log(err);
            }
            return res.json(result);
        })
    });

    function calculRemboursement(valeurAuDessus, total, nbPersonneEnDessous, valeurAuDessous, moyenne){

        if(valeurAuDessous == 0){
            const result = (((valeurAuDessus-moyenne)/nbPersonneEnDessous)/total)/(1/total)*1;
            return result;
        }else{
            const result = (((valeurAuDessus-moyenne)/nbPersonneEnDessous)/total)/((moyenne-valeurAuDessous)/total)*valeurAuDessus;
            return result;
        }
    }

router.route("/groupeRoutes/ajoutUtilGroupe")
    .post((req, res)=>{
        async.waterfall([

            function(callback){
                // Recherche de l'utilisateur qui veut rejoindre un groupe:
                User.model.findById({_id:req.body.user.id}).then((user)=>{
                    callback(null, user);
                })
            },
            function(user, callback){
                // Recherche du groupe que l'utilisateur veut rejoindre.
                Groupe.model.findById({_id:req.body.groupe.id}).then((groupe)=>{
                    callback(null, groupe, user);
                })
            },
            function(groupe, user, callback){
                //Verif de si le user existe deja dans le groupe
                let exist = false;
                for (const userG of groupe.users) {
                    if(userG.user.id == user._id){
                        exist=true;
                    }
                } 
                if(exist == true){
                    res.json({success:false, message:"user is already in this group"});
                }else{
                    callback(null, groupe, user);
                }
            },
            function(groupe, user, callback){
                const tabUser = {total:0, user:user};
                groupe.users.push(tabUser);
                groupe.save();
                callback(null, {success: true, message:"user "+user.name+" added"});
            }

        ],function(err, result){
            if(err){
                return err;
            }
            res.json(result);
        });
    })

module.exports = router;