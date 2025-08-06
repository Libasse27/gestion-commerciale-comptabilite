const { CompteClient } = require('../models');

const comptesClientsData = [
    {
        nom: 'Client A',
        solde: 1500.00,
        email: 'clienta@example.com',
        telephone: '0600000001'
    },
    {
        nom: 'Client B',
        solde: 2500.50,
        email: 'clientb@example.com',
        telephone: '0600000002'
    },
    {
        nom: 'Client C',
        solde: 500.75,
        email: 'clientc@example.com',
        telephone: '0600000003'
    }
];

async function seedComptesClients() {
    try {
        await CompteClient.destroy({ where: {} }); // Vide la table avant d'insérer
        await CompteClient.bulkCreate(comptesClientsData);
        console.log('Comptes clients seedés avec succès.');
    } catch (error) {
        console.error('Erreur lors du seeding des comptes clients:', error);
    }
}

module.exports = seedComptesClients;