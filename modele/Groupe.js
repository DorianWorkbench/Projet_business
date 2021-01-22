const mongoose = require("mongoose");
const Transaction = require("./Transaction");
const User = require("./User");

// Ceux qui auront le statut à true verront le montant à rembourser
// Seul celui qui aura le statut "false" se verra afficher pour se faire rembourser.
// Celui avec le statut false ne verra pas la personne à rembourser vu que c'est lui qui doit être remboursé
// Ceux avec le statut true verront la personne avec le statut false et la somme qu'ils devront débourser.

const groupeSchema = mongoose.Schema({
    title:String,
    transaction:[Transaction.schema],
    users:[{
        total:Number,
        user:User.schema
    }],

   // Total amount
    total:Number,
    refunder: [{
        userQuiAMoinsPaye:User.schema,
        usersArembourser:[{
            amount:Number,
            user:User.schema
        }]
    }]
    // Tableau de montant/user permetant de savoir qui doit combien à qui
    // Si on ne doit rien, notre montant est à 0.
    // Si on doit quelque chose, le montant augmente.
    
    // Raffraichit pour tous les autres membres que celui qui a fait une entrée la somme divisé par n-1.
    // Définit au moment d'une transaction (update)

    // Lors d'un remboursement on updatera juste le refund de groupe
    // refund:[{
    //     amount:Number,
    //     user: User.schema
    // }]
});

module.exports={
    schema:groupeSchema,
    model:mongoose.model("Groupe", groupeSchema)
}