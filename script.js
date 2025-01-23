// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBuZpGvZsXHuE2djlJtMS-aSKlZLBpMKoo",
    authDomain: "guilgal-46426.firebaseapp.com",
    databaseURL: "https://guilgal-46426-default-rtdb.firebaseio.com",
    projectId: "guilgal-46426",
    storageBucket: "guilgal-46426.firebasestorage.app",
    messagingSenderId: "545432703753",
    appId: "1:545432703753:web:64823e084079f1e57fb9d8",
    measurementId: "G-0F61YDFCCY"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Default markup values, will be overridden by settings from Firebase if available
let detailMarkupPercentage = 20; // Default 20% markup for detail price
let wholesaleMarkupPercentage = 15; // Default 15% markup for wholesale price

// Références aux éléments du DOM
const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('.section');
const venteForm = document.getElementById('venteForm');
const stockForm = document.getElementById('stockForm');
const stockTable = document.getElementById('stockTable').querySelector('tbody');
const beneficesTable = document.getElementById('beneficesTable').querySelector('tbody');
const recouvrementTable = document.getElementById('recouvrementTable').querySelector('tbody');
const ventesTable = document.getElementById('ventesTable').querySelector('tbody');
const boutiqueSelect = document.getElementById('boutiqueSelect');
const dateDebut = document.getElementById('dateDebut');
const dateFin = document.getElementById('dateFin');
const genererBeneficesButton = document.getElementById('genererBenefices');
const beneficeTotalSpan = document.getElementById('beneficeTotal');
const ventesJourSpan = document.getElementById('ventesJour');
const stockAlerteUl = document.getElementById('stockAlerte');
const imeiAVerifierInput = document.getElementById('imeiAVerifier');
const verifierImeiButton = document.getElementById('verifierImei');
const resultatVerificationDiv = document.getElementById('resultatVerification');
const produitResultatSpan = document.getElementById('produitResultat');
const dateVenteResultatSpan = document.getElementById('dateVenteResultat');
const nomClientResultatSpan = document.getElementById('nomClientResultat');
const statutPaiementResultatSpan = document.getElementById('statutPaiementResultat');
const depensesSpan = document.getElementById('depenses');
const dateDebutFilter = document.getElementById('dateDebutFilter');
const dateFinFilter = document.getElementById('dateFinFilter');
const filtrerBtn = document.getElementById('filtrerBtn');
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');
const topVentesSemaineTable = document.getElementById('topVentesSemaine').querySelector('tbody');
const topVentesMoisTable = document.getElementById('topVentesMois').querySelector('tbody');
const invendusSemaineTable = document.getElementById('invendusSemaine').querySelector('tbody');
const invendusMoisTable = document.getElementById('invendusMois').querySelector('tbody');
const ventesParVendeurTable = document.getElementById('ventesParVendeur').querySelector('tbody');
const topSellerWeekSpan = document.getElementById('topSellerWeek');
const topSellerMonthSpan = document.getElementById('topSellerMonth');
const capitalGeneralSpan = document.getElementById('capitalGeneral');
const beneficeGeneralSpan = document.getElementById('beneficeGeneral');
const statusMessageDiv = document.getElementById('statusMessage'); // Référence au div de message de statut
const totalPurchasePriceValueCell = document.getElementById('totalPurchasePriceValue');
const totalSellingPriceValueCell = document.getElementById('totalSellingPriceValue');


// Variables pour stocker l'état de l'utilisateur
let currentUser = null;
let currentUserId = null;

// Fonction pour afficher la section sélectionnée et cacher les autres
function afficherSection(sectionId) {
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
}

// Gestion des clics sur les liens de navigation
navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const sectionId = this.dataset.section;
        afficherSection(sectionId);
    });
});

// Fonction pour récupérer la liste des produits depuis Firebase
function getProduits() {
  const produitsRef = database.ref('produits');
  produitsRef.on('value', (snapshot) => {
    const produits = snapshot.val();
    const produitsListe = document.getElementById('produitsListe');
    const produitVenteSelect = document.getElementById('produitVente');
    produitsListe.innerHTML = ''; // Vider la liste existante
    produitVenteSelect.innerHTML = '<option value="">Sélectionnez un produit</option>';

    for (const produitId in produits) {
      const produit = produits[produitId];
      const option = document.createElement('option');
      option.value = produit.nom;
      produitsListe.appendChild(option);

      // Créer une nouvelle option pour chaque produit
      const optionVente = document.createElement('option');
      optionVente.value = produit.nom;
      optionVente.text = produit.nom;
      produitVenteSelect.appendChild(optionVente);
    }
  });
}

// Appeler la fonction pour initialiser la liste des produits
getProduits();

// Fonction pour afficher les messages de statut (succès/erreur)
function showStatusMessage(message, isSuccess = true) {
    statusMessageDiv.textContent = message;
    statusMessageDiv.classList.remove('hidden');
    if (isSuccess) {
        statusMessageDiv.style.backgroundColor = '#d4edda';
        statusMessageDiv.style.color = '#155724';
        statusMessageDiv.style.borderColor = '#c3e6cb';
    } else {
        statusMessageDiv.style.backgroundColor = '#f8d7da';
        statusMessageDiv.style.color = '#721c24';
        statusMessageDiv.style.borderColor = '#f5c6cb';
    }

    setTimeout(() => {
        statusMessageDiv.classList.add('hidden');
    }, 3000); // Disparaît après 3 secondes
}


// Gestion de la soumission du formulaire de vente
venteForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const dateVente = document.getElementById('dateVente').value;
    const produitVente = document.getElementById('produitVente').value;
    const quantiteVente = parseInt(document.getElementById('quantiteVente').value);
    const prixUnitaireVente = parseFloat(document.getElementById('prixUnitaireVente').value);
    const typeVente = document.getElementById('typeVente').value;
    const imeiVente = document.getElementById('imeiVente').value;
    const nomClient = document.getElementById('nomClient').value;
    const telClient = document.getElementById('telClient').value;
    const estPaye = document.getElementById('estPaye').checked;
    const boutique = boutiqueSelect.value;
    const prixTotal = quantiteVente * prixUnitaireVente;

    // Récupérer le nom de l'utilisateur actuel
    const vendeur = currentUser;

    // Enregistrer la vente dans Firebase
    const venteRef = database.ref(`ventes/${boutique}`).push();
    venteRef.set({
        date: dateVente,
        produit: produitVente,
        quantite: quantiteVente,
        prixUnitaire: prixUnitaireVente,
        type: typeVente,
        imei: imeiVente,
        nomClient: nomClient,
        telClient: telClient,
        statutPaiement: estPaye ? 'Payé' : 'Non payé',
        prixTotal: prixTotal,
        vendeur: vendeur // Ajouter le nom de l'utilisateur actuel comme vendeur
    })
    .then(() => {
        showStatusMessage('Vente enregistrée avec succès!');
        venteForm.reset();
        // Mettre à jour le stock
        mettreAJourStock(produitVente, quantiteVente, boutique, 'vente', typeVente);
          // Recharger le tableau des ventes
        chargerVentes(boutique);
    })
    .catch(error => {
        console.error("Erreur lors de l'enregistrement de la vente:", error);
        showStatusMessage("Erreur lors de l'enregistrement de la vente.", false);
    });
});
// Fonction pour charger les ventes
function chargerVentes(boutique) {
    const ventesRef = database.ref(`ventes/${boutique}`);
    ventesRef.on('value', (snapshot) => {
        ventesTable.innerHTML = ''; // Vider le tableau
        snapshot.forEach(childSnapshot => {
            const vente = childSnapshot.val();
            const row = ventesTable.insertRow();
            row.insertCell().textContent = vente.date;
            row.insertCell().textContent = vente.produit;
            row.insertCell().textContent = vente.quantite;
            row.insertCell().textContent = vente.prixUnitaire;
            row.insertCell().textContent = vente.prixTotal;
            row.insertCell().textContent = vente.type;
            row.insertCell().textContent = vente.nomClient;
            row.insertCell().textContent = vente.telClient;
            row.insertCell().textContent = vente.statutPaiement;
            row.insertCell().textContent = vente.vendeur;

            // Ajouter les icônes d'action
            const actionsCell = row.insertCell();
            const actionIcons = document.createElement('div');
            actionIcons.className = 'action-icons';

            const editIcon = document.createElement('i');
            editIcon.className = 'fas fa-edit';
            editIcon.addEventListener('click', () => {
                // Remplir le formulaire de vente avec les données actuelles de la vente
                document.getElementById('dateVente').value = vente.date;
                document.getElementById('produitVente').value = vente.produit;
                document.getElementById('quantiteVente').value = vente.quantite;
                document.getElementById('prixUnitaireVente').value = vente.prixUnitaire;
                document.getElementById('typeVente').value = vente.type;
                document.getElementById('imeiVente').value = vente.imei;
                document.getElementById('nomClient').value = vente.nomClient;
                document.getElementById('telClient').value = vente.telClient;
                document.getElementById('estPaye').checked = vente.statutPaiement === 'Payé';

                // Modifier le bouton pour indiquer une mise à jour
                venteForm.querySelector('button[type="submit"]').textContent = 'Mettre à jour';

                // Ajouter un identifiant unique au formulaire pour savoir quelle vente modifier
                venteForm.dataset.venteId = childSnapshot.key;
            });

            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt';
            deleteIcon.addEventListener('click', () => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer cette vente ?`)) {
                    supprimerVente(childSnapshot.key, boutique);
                }
            });

            actionIcons.appendChild(editIcon);
            actionIcons.appendChild(deleteIcon);
            actionsCell.appendChild(actionIcons);
        });
    });
}

// Gestionnaire d'événement pour la mise à jour d'une vente
venteForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const venteId = venteForm.dataset.venteId;

    if (venteId) {
        // Mettre à jour la vente existante
        const dateVente = document.getElementById('dateVente').value;
        const produitVente = document.getElementById('produitVente').value;
        const quantiteVente = parseInt(document.getElementById('quantiteVente').value);
        const prixUnitaireVente = parseFloat(document.getElementById('prixUnitaireVente').value);
        const typeVente = document.getElementById('typeVente').value;
        const imeiVente = document.getElementById('imeiVente').value;
        const nomClient = document.getElementById('nomClient').value;
        const telClient = document.getElementById('telClient').value;
        const estPaye = document.getElementById('estPaye').checked;
        const boutique = boutiqueSelect.value;
        const prixTotal = quantiteVente * prixUnitaireVente;
        const vendeur = currentUser;

        const venteRef = database.ref(`ventes/${boutique}/${venteId}`);
        venteRef.update({
            date: dateVente,
            produit: produitVente,
            quantite: quantiteVente,
            prixUnitaire: prixUnitaireVente,
            type: typeVente,
            imei: imeiVente,
            nomClient: nomClient,
            telClient: telClient,
            statutPaiement: estPaye ? 'Payé' : 'Non payé',
            prixTotal: prixTotal,
            vendeur: vendeur
        })
        .then(() => {
            showStatusMessage('Vente mise à jour avec succès!');
            venteForm.reset();
            venteForm.querySelector('button[type="submit"]').textContent = 'Enregistrer';
            delete venteForm.dataset.venteId;
            chargerVentes(boutique);
        })
        .catch(error => {
            console.error("Erreur lors de la mise à jour de la vente:", error);
            showStatusMessage("Erreur lors de la mise à jour de la vente.", false);
        });
    } else {
        // Enregistrement d'une nouvelle vente (logique existante)
        // ...
    }
});

// Fonction pour supprimer une vente
function supprimerVente(venteId, boutique) {
    const venteRef = database.ref(`ventes/${boutique}/${venteId}`);
    venteRef.remove()
    .then(() => {
        showStatusMessage(`Vente supprimée avec succès!`);
        chargerVentes(boutique); // Recharger les ventes
    })
    .catch(error => {
        console.error("Erreur lors de la suppression de la vente:", error);
        showStatusMessage("Erreur lors de la suppression de la vente.", false);
    });
}


// Gestion de la soumission du formulaire de stock
stockForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const produit = document.getElementById('produitStock').value;
    const stockInitial = parseInt(document.getElementById('stockInitial').value);
    const approvisionnement = parseInt(document.getElementById('approvisionnement').value);
    const prixAchat = parseFloat(document.getElementById('prixAchat').value);
    const boutique = boutiqueSelect.value;
    const quantiteApprovisionnement = approvisionnement; // Quantité ajoutée au stock est l'approvisionnement
    const dateApprovisionnement = new Date().toISOString().split('T')[0]; // Date actuelle pour l'approvisionnement
    const vendeurApprovisionnement = currentUser; // Vendeur qui effectue l'approvisionnement

    // Calculate selling prices based on markup percentages
    const prixVenteDetail = prixAchat * (1 + (detailMarkupPercentage / 100));
    const prixVenteGros = prixAchat * (1 + (wholesaleMarkupPercentage / 100));

    // Ajouter le produit au stock dans Firebase
    const stockRef = database.ref(`stock/${boutique}/${produit}`);
    stockRef.once('value', (snapshot) => {
        const existingStock = snapshot.val();
        if (existingStock) {
            // Le produit existe déjà, mettre à jour la quantité et l'approvisionnement
            const newQuantite = existingStock.quantite + quantiteApprovisionnement;
            const newApprovisionnementTotal = existingStock.approvisionnement + quantiteApprovisionnement; // Mettre à jour le total approvisionné

            stockRef.update({
                quantite: newQuantite,
                prixAchat: prixAchat,
                approvisionnement: newApprovisionnementTotal, // Mettre à jour le total de l'approvisionnement
                prixVenteDetail: prixVenteDetail, // Calcul du prix de vente (détail)
                prixVenteGros: prixVenteGros // Calcul du prix de vente (gros)
            })
            .then(() => {
                // Enregistrer l'événement d'approvisionnement séparément
                const approvisionnementRef = database.ref(`approvisionnements/${boutique}`).push();
                approvisionnementRef.set({
                    dateApprovisionnement: dateApprovisionnement,
                    produit: produit,
                    quantiteApprovisionnement: quantiteApprovisionnement,
                    prixAchatUnitaire: prixAchat,
                    vendeurApprovisionnement: vendeurApprovisionnement
                }).then(() => {
                    showStatusMessage('Stock mis à jour et approvisionnement enregistré avec succès!');
                    stockForm.reset();
                    chargerStock(boutique); // Recharger le stock
                    updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général
                }).catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'approvisionnement:", error);
                    showStatusMessage("Erreur lors de l'enregistrement de l'approvisionnement.", false);
                });
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du stock:", error);
                showStatusMessage("Erreur lors de la mise à jour du stock.", false);
            });
        } else {
            // Le produit n'existe pas, l'ajouter au stock
            stockRef.set({
                quantite: stockInitial + quantiteApprovisionnement, // Stock final est stock initial + approvisionnement
                prixAchat: prixAchat,
                stockInitial: stockInitial,
                approvisionnement: quantiteApprovisionnement, // L'approvisionnement initial
                prixVenteDetail: prixVenteDetail, // Calcul du prix de vente (détail)
                prixVenteGros: prixVenteGros // Calcul du prix de vente (gros)
            })
            .then(() => {
                // Enregistrer l'événement d'approvisionnement initial
                const approvisionnementRef = database.ref(`approvisionnements/${boutique}`).push();
                approvisionnementRef.set({
                    dateApprovisionnement: dateApprovisionnement,
                    produit: produit,
                    quantiteApprovisionnement: quantiteApprovisionnement,
                    prixAchatUnitaire: prixAchat,
                    vendeurApprovisionnement: vendeurApprovisionnement
                }).then(() => {
                    showStatusMessage('Produit ajouté au stock et approvisionnement enregistré avec succès!');
                    stockForm.reset();
                    chargerStock(boutique); // Recharger le stock
                    updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général
                }).catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'approvisionnement initial:", error);
                    showStatusMessage("Erreur lors de l'enregistrement de l'approvisionnement initial.", false);
                });
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du produit au stock:", error);
                showStatusMessage("Erreur lors de l'ajout du produit au stock.", false);
            });
        }
    });
       // Enregistrer ou mettre à jour le produit dans la liste des produits
    const produitsRef = database.ref('produits');
    produitsRef.orderByChild('nom').equalTo(produit).once('value', (snapshot) => {
        if (snapshot.exists()) {
            // Le produit existe déjà, pas besoin de faire quoi que ce soit
        } else {
            // Le produit n'existe pas, l'ajouter à la liste des produits
            const newProduitRef = produitsRef.push();
            newProduitRef.set({
                nom: produit
            })
            .then(() => {
                console.log('Produit ajouté à la liste des produits');
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du produit à la liste des produits:", error);
            });
        }
    });
});

// Fonction pour mettre à jour le stock (inchangée, fonctionne toujours pour les ventes)
function mettreAJourStock(produit, quantite, boutique, typeOperation, typeVente) {
    const stockRef = database.ref(`stock/${boutique}/${produit}`);
    stockRef.transaction(stockActuel => {
        if (stockActuel) {
            if (typeOperation === 'vente') {
                if (stockActuel.quantite >= quantite) {
                    stockActuel.quantite -= quantite;
                     if (typeVente === 'detail') {
                        // Mettre à jour le prix de vente si c'est une vente au détail
                       return stockActuel;
                    } else if (typeVente === 'gros') {

                       return stockActuel;
                    }
                } else {
                    showStatusMessage("Quantité insuffisante en stock.", false);
                    return; // Annuler la transaction
                }
            } else if (typeOperation === 'ajout') {
                stockActuel.quantite += quantite;
            }
        }
        return stockActuel;
    }, (error, committed) => {
        if (error) {
            console.error("Erreur lors de la mise à jour du stock:", error);
            showStatusMessage("Erreur lors de la mise à jour du stock.", false);
        } else if (committed) {
            console.log("Stock mis à jour avec succès.");
            chargerStock(boutique);
            updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général après vente
        } else {
            console.log("La transaction de mise à jour du stock a été annulée.");
        }
    });
}

// Fonction pour charger le stock
function chargerStock(boutique) {
    const stockRef = database.ref(`stock/${boutique}`);
    stockRef.on('value', (snapshot) => {
        stockTable.innerHTML = ''; // Vider le corps du tableau (tbody)
        let totalPurchasePriceSum = 0;
        let totalSellingPriceSum = 0;

        snapshot.forEach(childSnapshot => {
            const produit = childSnapshot.key;
            const details = childSnapshot.val();
            const row = stockTable.insertRow();
            row.insertCell().textContent = produit;
            row.insertCell().textContent = details.stockInitial !== undefined ? details.stockInitial : 'N/A';
            row.insertCell().textContent = details.approvisionnement !== undefined ? details.approvisionnement : 'N/A';
            row.insertCell().textContent = details.quantite;
            row.insertCell().textContent = details.prixAchat;
            row.insertCell().textContent = details.prixVenteDetail;
            row.insertCell().textContent = details.prixVenteGros;

            const totalPurchasePrice = details.quantite * details.prixAchat;
            const totalSellingPrice = details.quantite * details.prixVenteDetail;

            row.insertCell().textContent = totalPurchasePrice.toFixed(2);
            row.insertCell().textContent = totalSellingPrice.toFixed(2);

            totalPurchasePriceSum += totalPurchasePrice;
            totalSellingPriceSum += totalSellingPrice;


            const actionsCell = row.insertCell();
            const actionIcons = document.createElement('div');
            actionIcons.className = 'action-icons';

            const editIcon = document.createElement('i');
            editIcon.className = 'fas fa-edit';
            editIcon.addEventListener('click', () => {
                 // Remplir le formulaire de stock avec les données actuelles du produit
                document.getElementById('produitStock').value = produit;
                document.getElementById('stockInitial').value = details.stockInitial !== undefined ? details.stockInitial : 0;
                document.getElementById('approvisionnement').value = details.approvisionnement !== undefined ? details.approvisionnement : 0;
                document.getElementById('prixAchat').value = details.prixAchat;

                // Optionnel : Modifier le bouton pour indiquer une mise à jour
                stockForm.querySelector('button[type="submit"]').textContent = 'Mettre à jour';
                stockForm.dataset.produit = produit;
            });

            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt';
            deleteIcon.addEventListener('click', () => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${produit} du stock?`)) {
                    supprimerProduitDuStock(produit, boutique);
                }
            });
             const approvisionnerIcon = document.createElement('i');
            approvisionnerIcon.className = 'fas fa-box-open';
            approvisionnerIcon.addEventListener('click', () => {
                approvisionnerProduitDuStock(produit, boutique);
            });


            actionIcons.appendChild(editIcon);
            actionIcons.appendChild(deleteIcon);
             actionIcons.appendChild(approvisionnerIcon);
            actionsCell.appendChild(actionIcons);
        });

        totalPurchasePriceValueCell.textContent = totalPurchasePriceSum.toFixed(2);
        totalSellingPriceValueCell.textContent = totalSellingPriceSum.toFixed(2);

        updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général après chargement du stock
    });
}
// Fonction pour supprimer un produit du stock
function supprimerProduitDuStock(produit, boutique) {
    const stockRef = database.ref(`stock/${boutique}/${produit}`);
    stockRef.remove()
    .then(() => {
        showStatusMessage(`${produit} supprimé du stock avec succès!`);
        chargerStock(boutique); // Recharger le stock
        updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général après suppression
    })
    .catch(error => {
        console.error("Erreur lors de la suppression du produit du stock:", error);
        showStatusMessage("Erreur lors de la suppression du produit du stock.", false);
    });
}
// Fonction pour approvisionner un produit du stock (améliorée pour utiliser le formulaire)
function approvisionnerProduitDuStock(produit, boutique) {
    // Pré-remplir le formulaire de stock avec le produit à approvisionner
    document.getElementById('produitStock').value = produit;
    document.getElementById('produitStock').readOnly = true; // Optionnel: rendre le champ produit non modifiable
    document.getElementById('stockInitial').value = 0; // Réinitialiser stock initial pour approvisionnement
    document.getElementById('approvisionnement').focus(); // Focus sur le champ approvisionnement
    stockForm.querySelector('button[type="submit"]').textContent = 'Approvisionner'; // Changer le texte du bouton

    // Gestionnaire d'événement unique pour l'approvisionnement via le formulaire
    const approvisionnerSubmitHandler = function(event) {
        event.preventDefault();
        const produitAppro = document.getElementById('produitStock').value;
        const approvisionnementQuantite = parseInt(document.getElementById('approvisionnement').value);
        const prixAchatAppro = parseFloat(document.getElementById('prixAchat').value);
        const dateApprovisionnement = new Date().toISOString().split('T')[0];
        const vendeurApprovisionnement = currentUser;

        if(isNaN(approvisionnementQuantite) || approvisionnementQuantite <= 0 || isNaN(prixAchatAppro) || prixAchatAppro < 0) {
            showStatusMessage("Veuillez entrer une quantité et un prix d'achat valides pour l'approvisionnement.", false);
            return;
        }

        const stockRef = database.ref(`stock/${boutique}/${produitAppro}`);
        stockRef.transaction(currentStock => {
            if (currentStock) {
                currentStock.quantite += approvisionnementQuantite;
                currentStock.approvisionnement = (currentStock.approvisionnement || 0) + approvisionnementQuantite; // Mettre à jour total approvisionné
                currentStock.prixAchat = prixAchatAppro; // Mettre à jour prix d'achat si nécessaire
            }
            return currentStock;
        }, (error, committed, snapshot) => {
            if (error) {
                console.error("Erreur lors de l'approvisionnement du stock:", error);
                showStatusMessage("Erreur lors de l'approvisionnement du stock.", false);
            } else if (committed) {
                 // Enregistrer l'événement d'approvisionnement séparément
                const approvisionnementRef = database.ref(`approvisionnements/${boutique}`).push();
                approvisionnementRef.set({
                    dateApprovisionnement: dateApprovisionnement,
                    produit: produitAppro,
                    quantiteApprovisionnement: approvisionnementQuantite,
                    prixAchatUnitaire: prixAchatAppro,
                    vendeurApprovisionnement: vendeurApprovisionnement
                }).then(() => {
                    showStatusMessage(`${produitAppro} approvisionné avec succès!`);
                    stockForm.reset();
                    document.getElementById('produitStock').readOnly = false; // Réactiver le champ produit
                    stockForm.querySelector('button[type="submit"]').textContent = 'Ajouter au stock'; // Restaurer le texte du bouton
                    chargerStock(boutique);
                    updateCapitalGeneralAndBeneficeGeneral(boutique);
                    stockForm.removeEventListener('submit', approvisionnerSubmitHandler); // Supprimer ce gestionnaire après utilisation
                }).catch(error => {
                    console.error("Erreur lors de l'enregistrement de l'approvisionnement:", error);
                    showStatusMessage("Erreur lors de l'enregistrement de l'approvisionnement.", false);
                });

            } else {
                showStatusMessage("Approvisionnement annulé.", false);
            }
        });
    };

    stockForm.addEventListener('submit', approvisionnerSubmitHandler); // Ajouter le gestionnaire d'événement unique
}


// Charger le stock au chargement de la page
// Remplacé par la logique de chargement des boutiques

// Gestion du changement de boutique
boutiqueSelect.addEventListener('change', () => {
    const boutique = boutiqueSelect.value;
    if (boutique === 'Toutes') {
        chargerStockToutesBoutiques();
         chargerBenefices('Toutes');

    } else {
        chargerStock(boutique);
        chargerBenefices(boutique);

    }
     chargerVentesDuJour(boutique);
     chargerAlertesStock(boutique);
    chargerVentes(boutique);
     updateCapitalGeneralAndBeneficeGeneral(boutique); // Mettre à jour le capital et bénéfice général au changement de boutique
     chargerRecouvrements(boutique); // Charger les recouvrements pour la boutique sélectionnée
     updateVentesChart(boutique); // Mise à jour du graphique pour la boutique sélectionnée
     // Mettre à jour les analyses pour la boutique sélectionnée
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const dateFinSemaine = nextWeek.toISOString().split('T')[0];

    getTopSellingProducts(boutique, today, dateFinSemaine, 5, 'week');
    getTopSellingProducts(boutique, getFirstDayOfCurrentMonth().toISOString().split('T')[0], today, 5, 'month');
    getUnsoldProducts(boutique, today, dateFinSemaine, 'week');
    getUnsoldProducts(boutique, getFirstDayOfCurrentMonth().toISOString().split('T')[0], today, 'month');
    getSalesBySeller(boutique,  getFirstDayOfCurrentMonth().toISOString().split('T')[0], today);
    loadMarkupPercentages(); // Load markup percentages when boutique changes
});

// Fonction pour charger les données de toutes les boutiques
function chargerStockToutesBoutiques() {
    stockTable.innerHTML = ''; // Vider le tableau
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
     const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });

            let totalPurchasePriceSumAllBoutiques = 0;
            let totalSellingPriceSumAllBoutiques = 0;

            boutiques.forEach(boutique => {
                const stockRef = database.ref(`stock/${boutique}`);
                stockRef.once('value', (snapshot) => {
                    snapshot.forEach(childSnapshot => {
                        const produit = childSnapshot.key;
                        const details = childSnapshot.val();
                        const row = stockTable.insertRow();
                        row.insertCell().textContent = `${boutique} - ${produit}`;
                         row.insertCell().textContent = details.stockInitial !== undefined ? details.stockInitial : 'N/A';
                        row.insertCell().textContent = details.approvisionnement !== undefined ? details.approvisionnement : 'N/A';
                        row.insertCell().textContent = details.quantite;
                        row.insertCell().textContent = details.prixAchat;
                        row.insertCell().textContent = details.prixVenteDetail;
                        row.insertCell().textContent = details.prixVenteGros;

                        const totalPurchasePrice = details.quantite * details.prixAchat;
                        const totalSellingPrice = details.quantite * details.prixVenteDetail;

                        row.insertCell().textContent = totalPurchasePrice.toFixed(2);
                        row.insertCell().textContent = totalSellingPrice.toFixed(2);

                        totalPurchasePriceSumAllBoutiques += totalPurchasePrice;
                        totalSellingPriceSumAllBoutiques += totalSellingPrice;

                        row.insertCell().textContent = 'Non applicable'; // Actions non applicables en mode "Toutes les boutiques"
                    });
                     totalPurchasePriceValueCell.textContent = totalPurchasePriceSumAllBoutiques.toFixed(2);
                     totalSellingPriceValueCell.textContent = totalSellingPriceSumAllBoutiques.toFixed(2);
                });
            });
       });
        updateCapitalGeneralAndBeneficeGeneral('Toutes'); // Mettre à jour le capital et bénéfice général pour toutes les boutiques
}

// Fonction pour charger les bénéfices
function chargerBenefices(boutique) {
     beneficesTable.innerHTML = ''; // Vider le tableau
    if (boutique === 'Toutes') {

        const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
        const boutiquesRef = database.ref('boutiques');
        boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
        let beneficesToutesBoutiques = {};
        let totalVentes = 0;

        // Fonction pour fusionner les bénéfices de chaque boutique
        const fusionnerBenefices = (boutique, benefices, depenses) => {
            for (const produit in benefices) {
                if (!beneficesToutesBoutiques[produit]) {
                    beneficesToutesBoutiques[produit] = 0;
                }
                beneficesToutesBoutiques[produit] += benefices[produit];
            }
             depensesSpan.textContent = (parseFloat(depensesSpan.textContent) + depenses).toFixed(2);
            // Mettre à jour le tableau HTML avec les bénéfices fusionnés
            actualiserTableauBenefices(beneficesToutesBoutiques);
        };

        // Parcourir chaque boutique pour récupérer et fusionner les bénéfices
        boutiques.forEach(boutique => {
            const dateDebut = document.getElementById('dateDebut').value;
            const dateFin = document.getElementById('dateFin').value;
            calculerEtAfficherBenefices(boutique, dateDebut, dateFin)
                .then(({ benefices, depenses }) => {
                    // Fusionner les bénéfices de la boutique actuelle avec le total
                    fusionnerBenefices(boutique, benefices, depenses);
                })
                .catch(error => {
                    console.error("Erreur lors du calcul des bénéfices pour", boutique, error);
                });
        });

        // Mettre à jour le bénéfice total pour toutes les boutiques
        database.ref('benefices').once('value', (snapshot) => {
            const allBenefices = snapshot.val();
            let beneficeTotal = 0;

            for (const boutiqueKey in allBenefices) {
                for (const dateKey in allBenefices[boutiqueKey]) {
                    beneficeTotal += parseFloat(allBenefices[boutiqueKey][dateKey].total) || 0;
                }
            }

            beneficeTotalSpan.textContent = beneficeTotal.toFixed(2);
        });

        // Actualiser le tableau avec les données de toutes les boutiques
        const actualiserTableauBenefices = (benefices) => {
            beneficesTable.innerHTML = ''; // Vider le tableau
            for (const produit in benefices) {
                const row = beneficesTable.insertRow();
                row.insertCell().textContent = produit;
                row.insertCell().textContent = benefices[produit].toFixed(2);
            }
        };
      });
    } else {
        // Logique pour une seule boutique
        const dateDebut = document.getElementById('dateDebut').value;
        const dateFin = document.getElementById('dateFin').value;
        calculerEtAfficherBenefices(boutique, dateDebut, dateFin)
            .then(({ benefices, totalVentes, depenses }) => {
                beneficesTable.innerHTML = ''; // Vider le tableau
                for (const produit in benefices) {
                    const row = beneficesTable.insertRow();
                    row.insertCell().textContent = produit;
                    row.insertCell().textContent = benefices[produit].toFixed(2);
                }
                depensesSpan.textContent = depenses.toFixed(2);
            })
            .catch(error => {
                console.error("Erreur lors du calcul des bénéfices:", error);
            });

        // Calculer le bénéfice total pour la période et la boutique sélectionnées
        const beneficeRef = database.ref(`benefices/${boutique}`);
        beneficeRef.once('value', (snapshot) => {
            const benefices = snapshot.val();
            let beneficeTotal = 0;

            for (const date in benefices) {
                if (date >= dateDebut && date <= dateFin) {
                    beneficeTotal += parseFloat(benefices[date].total) || 0;
                }
            }

            beneficeTotalSpan.textContent = beneficeTotal.toFixed(2);
        });
    }
}

genererBeneficesButton.addEventListener('click', () => {
    const boutique = boutiqueSelect.value;
    chargerBenefices(boutique);
});
// Fonction pour calculer et afficher les bénéfices
function calculerEtAfficherBenefices(boutique, dateDebut, dateFin) {
    return new Promise((resolve, reject) => {
        const ventesRef = database.ref(`ventes/${boutique}`);
        let benefices = {};
        let totalVentes = 0;
        let depensesTotales = 0;

        ventesRef.once('value', (snapshot) => {
            const ventes = snapshot.val();
            let quantiteVendue = 0;

            for (const venteId in ventes) {
                const vente = ventes[venteId];
                if (vente.date >= dateDebut && vente.date <= dateFin) {
                    totalVentes += vente.prixTotal;
                    quantiteVendue += vente.quantite;

                    // Récupérer le prix d'achat du stock pour calculer la dépense
                    const stockRef = database.ref(`stock/${boutique}/${vente.produit}`);
                    stockRef.once('value', (stockSnapshot) => {
                        const stock = stockSnapshot.val();
                        if (stock) {
                            const coutVente = vente.quantite * stock.prixAchat;
                            const beneficeProduit = vente.prixTotal - coutVente;

                            if (!benefices[vente.produit]) {
                                benefices[vente.produit] = 0;
                            }
                            benefices[vente.produit] += beneficeProduit;
                        }

                        // Enregistrer le bénéfice dans la base de données
                        const beneficeRef = database.ref(`benefices/${boutique}/${vente.date}`);
                        beneficeRef.transaction((currentBenefice) => {
                            if (!currentBenefice) {
                                currentBenefice = { total: 0 };
                            }
                            // Recalculer le total en soustrayant les dépenses globales à la fin (pour éviter de les soustraire à chaque vente)
                            currentBenefice.total += beneficeProduit;
                            return currentBenefice;
                        }, (error, committed) => {
                            if (error) {
                                console.error("Erreur lors de l'enregistrement du bénéfice:", error);
                                reject(error);
                            } else if (committed) {
                                console.log("Bénéfice enregistré avec succès.");
                            } else {
                                console.log("La transaction d'enregistrement du bénéfice a été annulée.");
                            }
                        });
                    });
                }
            }
            // Après avoir traité toutes les ventes, soustraire les dépenses totales du bénéfice total
            let beneficeTotalCalculated = 0;
            for (const produit in benefices) {
                beneficeTotalCalculated += benefices[produit];
            }
            beneficeTotalSpan.textContent = beneficeTotalCalculated.toFixed(2);


            // Résoudre la promesse avec les bénéfices, le total des ventes et les dépenses
            resolve({ benefices, totalVentes});
        });

    });
}


// Fonction pour charger les recouvrements
function chargerRecouvrements(boutique) {
    recouvrementTable.innerHTML = '';
    const recouvrementsRef = database.ref(`ventes/${boutique}`);
    recouvrementsRef.on('value', (snapshot) => {
        snapshot.forEach(childSnapshot => {
            const vente = childSnapshot.val();
            if (vente.statutPaiement === 'Non payé') {
                const row = recouvrementTable.insertRow();
                row.insertCell().textContent = vente.nomClient;
                row.insertCell().textContent = vente.telClient;
                row.insertCell().textContent = vente.produit;
                row.insertCell().textContent = vente.prixTotal.toFixed(2);
                row.insertCell().textContent = vente.date;
                row.insertCell().textContent = vente.statutPaiement;

                const payerButton = document.createElement('button');
                payerButton.textContent = 'Payer';
                payerButton.addEventListener('click', () => {
                    marquerCommePaye(childSnapshot.key, boutique);
                });
                const actionsCell = row.insertCell();
                actionsCell.appendChild(payerButton);
            }
        });
    });
}

// Fonction pour marquer une vente comme payée
function marquerCommePaye(venteId, boutique) {
    const venteRef = database.ref(`ventes/${boutique}/${venteId}`);
    venteRef.update({ statutPaiement: 'Payé' })
    .then(() => {
        showStatusMessage('Vente marquée comme payée avec succès!');
        chargerRecouvrements(boutique); // Recharger les recouvrements
    })
    .catch(error => {
        console.error("Erreur lors de la mise à jour du statut de paiement:", error);
        showStatusMessage("Erreur lors de la mise à jour du statut de paiement.", false);
    });
}

// Charger les recouvrements pour la boutique sélectionnée
boutiqueSelect.addEventListener('change', () => {
    const boutique = boutiqueSelect.value;
    if (boutique === 'Toutes') {
        chargerRecouvrementsToutesBoutiques();
    } else {
        chargerRecouvrements(boutique);
    }
});

// Charger les recouvrements de toutes les boutiques
function chargerRecouvrementsToutesBoutiques() {
    recouvrementTable.innerHTML = '';
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
    const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
            boutiques.forEach(boutique => {
                const recouvrementsRef = database.ref(`ventes/${boutique}`);
                recouvrementsRef.on('value', (snapshot) => {
                    snapshot.forEach(childSnapshot => {
                        const vente = childSnapshot.val();
                        if (vente.statutPaiement === 'Non payé') {
                            const row = recouvrementTable.insertRow();
                            row.insertCell().textContent = `(${boutique}) ${vente.nomClient}`;
                            row.insertCell().textContent = vente.telClient;
                            row.insertCell().textContent = vente.produit;
                            row.insertCell().textContent = vente.prixTotal.toFixed(2);
                            row.insertCell().textContent = vente.date;
                            row.insertCell().textContent = vente.statutPaiement;

                            const payerButton = document.createElement('button');
                            payerButton.textContent = 'Payer';
                            payerButton.addEventListener('click', () => {
                                marquerCommePaye(childSnapshot.key, boutique);
                            });
                            const actionsCell = row.insertCell();
                            actionsCell.appendChild(payerButton);
                        }
                    });
                });
            });
       });
}

// Charger les recouvrements au chargement de la page
// Remplacé par la logique de chargement des boutiques

// Fonction pour charger les ventes du jour
function chargerVentesDuJour(boutique) {
    const ventesRef = database.ref(`ventes/${boutique}`);
    ventesRef.on('value', (snapshot) => {
        const ventes = snapshot.val();
        const today = new Date().toISOString().split('T')[0];
        let ventesDuJour = 0;

        for (const venteId in ventes) {
            if (ventes[venteId].date === today) {
                ventesDuJour++;
            }
        }

        ventesJourSpan.textContent = ventesDuJour;
         // Appel de la fonction pour mettre à jour le graphique
        updateVentesChart(boutique);
    });
}

// Fonction pour charger les alertes de stock
function chargerAlertesStock(boutique) {
    const stockRef = database.ref(`stock/${boutique}`);
    stockRef.on('value', (snapshot) => {
        stockAlerteUl.innerHTML = ''; // Vider la liste
        snapshot.forEach(childSnapshot => {
            const produit = childSnapshot.key;
            const details = childSnapshot.val();
            if (details.quantite < 5) {
                const li = document.createElement('li');
                li.textContent = `${produit} : ${details.quantite} restant(s)`;
                stockAlerteUl.appendChild(li);
            }
        });
    });
}

// Charger les ventes du jour et les alertes de stock au chargement de la page
// Remplacé par la logique de chargement des boutiques

// Gestion de la vérification IMEI
verifierImeiButton.addEventListener('click', () => {
    const imeiAVerifier = imeiAVerifierInput.value;
     const boutiquesRef = database.ref('boutiques');
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
        let imeiTrouve = false;

        boutiques.forEach(boutique => {
            const ventesRef = database.ref(`ventes/${boutique}`);
            ventesRef.once('value', (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    const vente = childSnapshot.val();
                    if (vente.imei === imeiAVerifier) {
                        imeiTrouve = true;
                        produitResultatSpan.textContent = vente.produit;
                        dateVenteResultatSpan.textContent = vente.date;
                        nomClientResultatSpan.textContent = vente.nomClient;
                        statutPaiementResultatSpan.textContent = vente.statutPaiement;
                        resultatVerificationDiv.classList.remove('hidden');
                    }
                });

                if (!imeiTrouve) {
                    produitResultatSpan.textContent = 'IMEI non trouvé';
                    dateVenteResultatSpan.textContent = '';
                    nomClientResultatSpan.textContent = '';
                    statutPaiementResultatSpan.textContent = '';
                    resultatVerificationDiv.classList.remove('hidden');
                }
            });
        });
     });
});

// Fonction pour mettre à jour le graphique des ventes
function updateVentesChart(boutique) {
    const ventesRef = database.ref(`ventes/${boutique}`);
    ventesRef.once('value', (snapshot) => {
        const ventes = snapshot.val();
        const ventesParJour = {};

        for (const venteId in ventes) {
            const date = ventes[venteId].date;
            if (!ventesParJour[date]) {
                ventesParJour[date] = 0;
            }
            ventesParJour[date]++;
        }

        const labels = Object.keys(ventesParJour);
        const data = Object.values(ventesParJour);

        const ctx = document.getElementById('ventesChart').getContext('2d');
        if (window.ventesChart) {
            window.ventesChart.destroy();
        }
        window.ventesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Nombre de ventes par jour',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    });
}
// Fonction pour filtrer les données par boutique et par plage de dates
function filtrerDonnees(boutique, dateDebut, dateFin) {
    if (boutique === 'Toutes') {
        chargerStockToutesBoutiques();
        chargerBeneficesToutesBoutiques(dateDebut, dateFin);
        chargerRecouvrementsToutesBoutiques();
        chargerVentesDuJourToutesBoutiques();
    } else {
        chargerStock(boutique);
        chargerBenefices(boutique, dateDebut, dateFin);
        chargerRecouvrements(boutique);
        chargerVentesDuJour(boutique);
    }
}

// Gestion du clic sur le bouton de filtrage
filtrerBtn.addEventListener('click', () => {
    const boutique = boutiqueSelect.value;
    const dateDebut = dateDebutFilter.value;
    const dateFin = dateFinFilter.value;

    if (boutique === 'Toutes') {
        chargerStockToutesBoutiques();
        chargerBeneficesToutesBoutiques(dateDebut, dateFin);
        chargerRecouvrementsToutesBoutiques();
        chargerVentesDuJourToutesBoutiques();
        updateVentesChartToutesBoutiques(); // Mettre à jour le graphique pour toutes les boutiques
        // Mettre à jour les analyses
        getTopSellingProducts(boutique, dateDebut, dateFin, 5, 'week');
        getTopSellingProducts(boutique, dateDebut, dateFin, 5, 'month');
        getUnsoldProducts(boutique, dateDebut, dateFin, 'week');
        getUnsoldProducts(boutique, dateDebut, dateFin, 'month');
        getSalesBySeller(boutique, dateDebut, dateFin);

    } else {
        chargerStock(boutique);
        chargerBenefices(boutique, dateDebut, dateFin);
        chargerRecouvrements(boutique);
        chargerVentesDuJour(boutique);
        updateVentesChart(boutique); // Mettre à jour le graphique pour une boutique spécifique
         // Mettre à jour les analyses pour la boutique sélectionnée
        getTopSellingProducts(boutique, dateDebut, dateFin, 5, 'week');
        getTopSellingProducts(boutique, dateDebut, dateFin, 5, 'month');
        getUnsoldProducts(boutique, dateDebut, dateFin, 'week');
        getUnsoldProducts(boutique, dateDebut, dateFin, 'month');
        getSalesBySeller(boutique, dateDebut, dateFin);
    }
});

// Fonctions pour charger les bénéfices, les recouvrements et les ventes du jour pour toutes les boutiques
function chargerBeneficesToutesBoutiques(dateDebut, dateFin) {
    beneficesTable.innerHTML = '';
    depensesSpan.textContent = '0';
    beneficeTotalSpan.textContent = '0';
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
     const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
        let beneficesToutesBoutiques = {};

        const fusionnerBenefices = (boutique, benefices, depenses) => {
            for (const produit in benefices) {
                if (!beneficesToutesBoutiques[produit]) {
                    beneficesToutesBoutiques[produit] = 0;
                }
                beneficesToutesBoutiques[produit] += benefices[produit];
            }
            actualiserTableauBenefices(beneficesToutesBoutiques);
        };

        boutiques.forEach(boutique => {
            calculerEtAfficherBenefices(boutique, dateDebut, dateFin)
                .then(({ benefices, depenses }) => {
                    fusionnerBenefices(boutique, benefices, depenses);
                })
                .catch(error => {
                    console.error("Erreur lors du calcul des bénéfices pour", boutique, error);
                });
        });

        // Calculer le bénéfice total pour toutes les boutiques
        database.ref('benefices').once('value', (snapshot) => {
            const allBenefices = snapshot.val();
            let beneficeTotal = 0;
            for (const boutiqueKey in allBenefices) {
                for (const dateKey in allBenefices[boutiqueKey]) {
                    if (dateKey >= dateDebut && dateKey <= dateFin) {
                        beneficeTotal += parseFloat(allBenefices[boutiqueKey][dateKey].total) || 0;
                    }
                }
            }
            beneficeTotalSpan.textContent = beneficeTotal.toFixed(2);
        });
     });
}

function chargerRecouvrementsToutesBoutiques() {
    recouvrementTable.innerHTML = '';
     const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
     const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
        boutiques.forEach(boutique => {
            const recouvrementsRef = database.ref(`ventes/${boutique}`);
            recouvrementsRef.on('value', (snapshot) => {
                snapshot.forEach(childSnapshot => {
                    const vente = childSnapshot.val();
                    if (vente.statutPaiement === 'Non payé' && vente.date >= dateDebutFilter.value && vente.date <= dateFinFilter.value) {
                        const row = recouvrementTable.insertRow
                        row.insertCell().textContent = `(${boutique}) ${vente.nomClient}`;
                        row.insertCell().textContent = vente.telClient;
                        row.insertCell().textContent = vente.produit;
                        row.insertCell().textContent = vente.prixTotal.toFixed(2);
                        row.insertCell().textContent = vente.date;
                        row.insertCell().textContent = vente.statutPaiement;
                        const payerButton = document.createElement('button');
                        payerButton.textContent = 'Payer';
                        payerButton.addEventListener('click', () => {
                            marquerCommePaye(childSnapshot.key, boutique);
                        });
                        row.insertCell().appendChild(payerButton);
                    }
                });
            });
        });
     });
}

function chargerVentesDuJourToutesBoutiques() {
    const today = new Date().toISOString().split('T')[0];
    let ventesDuJourTotal = 0;
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
    const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });
        boutiques.forEach(boutique => {
            const ventesRef = database.ref(`ventes/${boutique}`);
            ventesRef.once('value', (snapshot) => {
                const ventes = snapshot.val();
                for (const venteId in ventes) {
                    if (ventes[venteId].date === today) {
                        ventesDuJourTotal++;
                    }
                }
                ventesJourSpan.textContent = ventesDuJourTotal;
            });
        });
    });
}

// Mettre à jour le graphique pour toutes les boutiques
function updateVentesChartToutesBoutiques() {
    const ventesParJour = {};
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
    const boutiquesRef = database.ref('boutiques');
     boutiquesRef.once('value').then((snapshot) => {
         snapshot.forEach(childSnapshot => {
                boutiques.push(childSnapshot.key);
            });

        const promises = boutiques.map(boutique => {
            return new Promise((resolve) => {
                const ventesRef = database.ref(`ventes/${boutique}`);
                ventesRef.once('value', (snapshot) => {
                    const ventes = snapshot.val();
                    for (const venteId in ventes) {
                        const date = ventes[venteId].date;
                        if (!ventesParJour[date]) {
                            ventesParJour[date] = 0;
                        }
                        ventesParJour[date]++;
                    }
                    resolve();
                });
            });
        });

        Promise.all(promises).then(() => {
            const labels = Object.keys(ventesParJour);
            const data = Object.values(ventesParJour);

            const ctx = document.getElementById('ventesChart').getContext('2d');
            if (window.ventesChart) {
                window.ventesChart.destroy();
            }
            window.ventesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Nombre de ventes par jour (Toutes les boutiques)',
                        data: data,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });
    });
}

// Fonction pour vérifier si l'utilisateur est connecté
// Fonction pour charger les noms des boutiques dans le sélecteur
function loadBoutiqueNames() {
    const boutiquesRef = database.ref('boutiques');
    boutiquesRef.once('value').then((snapshot) => {
        boutiqueSelect.innerHTML = '<option value="Toutes">Toutes les boutiques</option>'; // Réinitialiser les options
        snapshot.forEach(childSnapshot => {
            const boutique = childSnapshot.val();
            const option = document.createElement('option');
            option.value = childSnapshot.key; // Utilisez la clé de la boutique comme valeur
            option.text = boutique.name;
            boutiqueSelect.appendChild(option);
        });
         // Définir la date du jour comme date de début par défaut
        const today = new Date().toISOString().split('T')[0];
        dateDebutFilter.value = today;

        // Définir la date de fin comme la date du jour + 7 jours (une semaine)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        dateFinFilter.value = nextWeek.toISOString().split('T')[0];
        // Déclencher l'événement 'change' sur boutiqueSelect
        boutiqueSelect.dispatchEvent(new Event('change'));
    });
}

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    currentUser = sessionStorage.getItem('currentUser');
    if (isLoggedIn === 'true' && currentUser) {
        // Utilisateur connecté
        currentUserSpan.textContent = `Connecté en tant que : ${currentUser}`;
        logoutBtn.classList.remove('hidden');
         loadBoutiqueNames()
        afficherSection('accueil'); // Affiche la section d'accueil
        loadMarkupPercentages(); // Load markup percentages on login

    } else {
        // Utilisateur non connecté
        currentUserSpan.textContent = '';
        logoutBtn.classList.add('hidden');
        window.location.href = 'login.html'; // Rediriger vers la page de connexion
    }
}

// Gestionnaire d'événements pour le bouton de déconnexion
logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn'); // Supprimer l'indicateur de connexion
    sessionStorage.removeItem('currentUser'); // Supprimer le nom de l'utilisateur
    currentUser = null;
    currentUserSpan.textContent = '';
    logoutBtn.classList.add('hidden');
    window.location.href = 'login.html'; // Rediriger vers la page de connexion
});

// Function to load markup percentages from Firebase settings
function loadMarkupPercentages() {
    const settingsRef = database.ref('settings');
    settingsRef.once('value', (snapshot) => {
        const settings = snapshot.val();
        if (settings) {
            detailMarkupPercentage = settings.detailMarkup !== undefined ? parseFloat(settings.detailMarkup) : 20;
            wholesaleMarkupPercentage = settings.wholesaleMarkup !== undefined ? parseFloat(settings.wholesaleMarkup) : 15;
        } else {
            detailMarkupPercentage = 20; // Default value if no settings in Firebase
            wholesaleMarkupPercentage = 15; // Default value if no settings in Firebase
        }
    });
}


// Appeler la fonction pour initialiser le graphique
// Remplacé par la logique de chargement des boutiques

// Appeler la fonction pour vérifier l'état de connexion au chargement de la page
checkLoginStatus();
    // Fonctions pour l'analyse des ventes

    function getMondayOfCurrentWeek() {
        const today = new Date();
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(today.setDate(diff));
    }

    function getFirstDayOfCurrentMonth() {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), 1);
    }

    function getTopSellingProducts(boutique, startDate, endDate, topN, period) {

        const ventesRef = boutique === 'Toutes' ? database.ref('ventes') : database.ref(`ventes/${boutique}`);
        ventesRef.once('value', (snapshot) => {
            const allVentes = snapshot.val();
            let ventes = {};

            // Filtrer les ventes en fonction de la période sélectionnée
            for (const boutiqueKey in allVentes) {
                if (boutique === 'Toutes' || boutiqueKey === boutique) {
                    for (const venteId in allVentes[boutiqueKey]) {
                        const vente = allVentes[boutiqueKey][venteId];
                        if (vente.date >= startDate && vente.date <= endDate) {
                            if (!ventes[vente.produit]) {
                                ventes[vente.produit] = 0;
                            }
                            ventes[vente.produit]++;
                        }
                    }
                }
            }

            // Trier les produits par nombre de ventes
            let sortedProducts = Object.entries(ventes).sort((a, b) => b[1] - a[1]);

            // Mettre à jour le tableau HTML correspondant
            let table;
            if (period === 'week') {
                table = topVentesSemaineTable;
            } else if (period === 'month') {
                table = topVentesMoisTable;
            }
            table.innerHTML = '';
            for (let i = 0; i < Math.min(topN, sortedProducts.length); i++) {
                const row = table.insertRow();
                row.insertCell().textContent = i + 1;
                row.insertCell().textContent = sortedProducts[i][0];
                row.insertCell().textContent = sortedProducts[i][1];
            }
        });
    }

    function getUnsoldProducts(boutique, startDate, endDate, period) {

        const stockRef = boutique === 'Toutes' ? database.ref('stock') : database.ref(`stock/${boutique}`);
        const ventesRef = boutique === 'Toutes' ? database.ref('ventes') : database.ref(`ventes/${boutique}`);

        Promise.all([stockRef.once('value'), ventesRef.once('value')])
            .then(([stockSnapshot, ventesSnapshot]) => {
                const allStock = stockSnapshot.val();
                const allVentes = ventesSnapshot.val();
                let soldProducts = new Set();

                // Identifier les produits vendus dans la période sélectionnée
                for (const boutiqueKey in allVentes) {
                    if (boutique === 'Toutes' || boutiqueKey === boutique) {
                        for (const venteId in allVentes[boutiqueKey]) {
                            const vente = allVentes[boutiqueKey][venteId];
                            if (vente.date >= startDate && vente.date <= endDate) {
                                soldProducts.add(vente.produit);
                            }
                        }
                    }
                }

                // Identifier les produits non vendus
                let unsoldProducts = new Set();
                for (const boutiqueKey in allStock) {
                    if (boutique === 'Toutes' || boutiqueKey === boutique) {
                        for (const produit in allStock[boutiqueKey]) {
                            if (!soldProducts.has(produit)) {
                                unsoldProducts.add(produit);
                            }
                        }
                    }
                }

                // Mettre à jour le tableau HTML correspondant
                let table;
                if (period === 'week') {
                    table = invendusSemaineTable;
                } else if (period === 'month') {
                    table = invendusMoisTable;
                }
                table.innerHTML = '';
                unsoldProducts.forEach(product => {
                    const row = table.insertRow();
                    row.insertCell().textContent = product;
                });
            });
    }

   function getSalesBySeller(boutique, startDate, endDate) {

        const ventesRef = boutique === 'Toutes' ? database.ref('ventes') : database.ref(`ventes/${boutique}`);
        ventesRef.once('value', (snapshot) => {
            const allVentes = snapshot.val();
            let salesBySeller = {};

            // Filtrer les ventes en fonction de la période sélectionnée
            for (const boutiqueKey in allVentes) {
                if (boutique === 'Toutes' || boutiqueKey === boutique) {
                    for (const venteId in allVentes[boutiqueKey]) {
                        const vente = allVentes[boutiqueKey][venteId];
                        if (vente.date >= startDate && vente.date <= endDate) {
                            if (!salesBySeller[vente.vendeur]) {
                                salesBySeller[vente.vendeur] = 0;
                            }
                            salesBySeller[vente.vendeur] += vente.prixTotal;
                        }
                    }
                }
            }

            // Trier les vendeurs par total des ventes
            let sortedSellers = Object.entries(salesBySeller).sort((a, b) => b[1] - a[1]);

            // Mettre à jour le tableau HTML
            ventesParVendeurTable.innerHTML = '';
            for (let i = 0; i < sortedSellers.length; i++) {
                const row = ventesParVendeurTable.insertRow();
                row.insertCell().textContent = sortedSellers[i][0];
                row.insertCell().textContent = sortedSellers[i][1].toFixed(2);
            }
         // Trouver le meilleur vendeur de la semaine
            const topSellerWeek = sortedSellers.length > 0 ? sortedSellers[0][0] : 'N/A';
            topSellerWeekSpan.textContent = topSellerWeek;

            // Trouver le meilleur vendeur du mois
            const topSellerMonth = sortedSellers.length > 0 ? sortedSellers[0][0] : 'N/A';
            topSellerMonthSpan.textContent = topSellerMonth;
        });
    }
// Fonction pour générer et imprimer le PDF d'un tableau
function printTableToPDF(tableId) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const table = document.getElementById(tableId);

    // Titre pour le tableau (vous pouvez le personnaliser)
    let title = '';
    switch (tableId) {
        case 'ventesTable':
            title = 'Liste des ventes';
            break;
        case 'stockTable':
            title = 'Stock';
            break;
        case 'beneficesTable':
            title = 'Bénéfices';
            break;
        case 'recouvrementTable':
            title = 'Recouvrements';
            break;
         case 'topVentesSemaine':
            title = 'Top des ventes par semaine';
            break;
         case 'topVentesMois':
            title = 'Top des ventes par mois';
            break;
         case 'invendusSemaine':
            title = 'Produits invendus cette semaine';
            break;
         case 'invendusMois':
            title = 'Produits invendus ce mois';
            break;
         case 'ventesParVendeur':
            title = 'Ventes par vendeur';
            break;
        default:
            title = 'Tableau';
    }

    // Ajouter le titre au document
    doc.text(title, 14, 15);

    // Générer le tableau PDF à partir du tableau HTML
    doc.autoTable({ html: '#' + tableId, startY: 25 });

    // Ouvrir le PDF dans un nouvel onglet
    doc.output('dataurlnewwindow');
}

// Gestionnaires d'événements pour les boutons d'impression
document.getElementById('printVentes').addEventListener('click', function() {
    printTableToPDF('ventesTable');
});

document.getElementById('printStock').addEventListener('click', function() {
    printTableToPDF('stockTable');
});

document.getElementById('printBenefices').addEventListener('click', function() {
    printTableToPDF('beneficesTable');
});

document.getElementById('printRecouvrement').addEventListener('click', function() {
    printTableToPDF('recouvrementTable');
});


document.getElementById('printTopVentesSemaine').addEventListener('click', function() {
    printTableToPDF('topVentesSemaine');
});

document.getElementById('printTopVentesMois').addEventListener('click', function() {
    printTableToPDF('topVentesMois');
});

document.getElementById('printInvendusSemaine').addEventListener('click', function() {
    printTableToPDF('invendusSemaine');
});

document.getElementById('printInvendusMois').addEventListener('click', function() {
    printTableToPDF('invendusMois');
});

document.getElementById('printVentesParVendeur').addEventListener('click', function() {
    printTableToPDF('ventesParVendeur');
});

// Fonction pour mettre à jour le capital général et le bénéfice général
function updateCapitalGeneralAndBeneficeGeneral(boutique) {
    let capitalGeneral = 0;
    let beneficeGeneralEstime = 0;
    const stockRef = boutique === 'Toutes' ? database.ref('stock') : database.ref(`stock/${boutique}`);

    stockRef.once('value', (snapshot) => {
        const stockData = snapshot.val();
        if (stockData) {
            for (const produit in stockData) {
                const details = stockData[produit];
                capitalGeneral += (details.stockInitial !== undefined ? details.stockInitial : 0) * details.prixAchat; // Capital basé sur stock initial et prix d'achat
                beneficeGeneralEstime += details.quantite * (details.prixVenteDetail - details.prixAchat); // Bénéfice estimé si tout le stock actuel est vendu au détail
            }
        }
        capitalGeneralSpan.textContent = capitalGeneral.toFixed(2);
        beneficeGeneralSpan.textContent = beneficeGeneralEstime.toFixed(2);
    });
}