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

// Références aux éléments du DOM
const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('.section');
const venteForm = document.getElementById('venteForm');
const stockForm = document.getElementById('stockForm');
const stockTable = document.getElementById('stockTable').querySelector('tbody');
const beneficesTable = document.getElementById('beneficesTable').querySelector('tbody');
const recouvrementTable = document.getElementById('recouvrementTable').querySelector('tbody');
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
    produitsListe.innerHTML = ''; // Vider la liste existante

    for (const produitId in produits) {
      const produit = produits[produitId];
      const option = document.createElement('option');
      option.value = produit.nom;
      produitsListe.appendChild(option);
    }
  });
}

// Appeler la fonction pour initialiser la liste des produits
getProduits();

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
        prixTotal: prixTotal
    })
    .then(() => {
        alert('Vente enregistrée avec succès!');
        venteForm.reset();
        // Mettre à jour le stock
        mettreAJourStock(produitVente, quantiteVente, boutique, 'vente', typeVente);
    })
    .catch(error => {
        console.error("Erreur lors de l'enregistrement de la vente:", error);
        alert("Erreur lors de l'enregistrement de la vente.");
    });
});

// Gestion de la soumission du formulaire de stock
stockForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const produit = document.getElementById('produitStock').value;
    const quantite = parseInt(document.getElementById('quantiteStock').value);
    const prixAchat = parseFloat(document.getElementById('prixAchat').value);
    const boutique = boutiqueSelect.value;

    // Ajouter le produit au stock dans Firebase
    const stockRef = database.ref(`stock/${boutique}/${produit}`);
    stockRef.once('value', (snapshot) => {
        const existingStock = snapshot.val();
        if (existingStock) {
            // Le produit existe déjà, mettre à jour la quantité
            const newQuantite = existingStock.quantite + quantite;
            stockRef.update({
                quantite: newQuantite,
                prixAchat: prixAchat,
                prixVenteDetail: prixAchat * 1.20, // Calcul du prix de vente (détail)
                prixVenteGros: prixAchat * 1.15 // Calcul du prix de vente (gros)
            })
            .then(() => {
                alert('Stock mis à jour avec succès!');
                stockForm.reset();
                chargerStock(boutique); // Recharger le stock
            })
            .catch(error => {
                console.error("Erreur lors de la mise à jour du stock:", error);
                alert("Erreur lors de la mise à jour du stock.");
            });
        } else {
            // Le produit n'existe pas, l'ajouter au stock
            stockRef.set({
                quantite: quantite,
                prixAchat: prixAchat,
                prixVenteDetail: prixAchat * 1.20, // Calcul du prix de vente (détail)
                prixVenteGros: prixAchat * 1.15 // Calcul du prix de vente (gros)
            })
            .then(() => {
                alert('Produit ajouté au stock avec succès!');
                stockForm.reset();
                chargerStock(boutique); // Recharger le stock
            })
            .catch(error => {
                console.error("Erreur lors de l'ajout du produit au stock:", error);
                alert("Erreur lors de l'ajout du produit au stock.");
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

// Fonction pour mettre à jour le stock
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
                    alert("Quantité insuffisante en stock.");
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
            alert("Erreur lors de la mise à jour du stock.");
        } else if (committed) {
            console.log("Stock mis à jour avec succès.");
            chargerStock(boutique);
        } else {
            console.log("La transaction de mise à jour du stock a été annulée.");
        }
    });
}

// Fonction pour charger le stock
function chargerStock(boutique) {
    const stockRef = database.ref(`stock/${boutique}`);
    stockRef.on('value', (snapshot) => {
        stockTable.innerHTML = ''; // Vider le tableau
        snapshot.forEach(childSnapshot => {
            const produit = childSnapshot.key;
            const details = childSnapshot.val();
            const row = stockTable.insertRow();
            row.insertCell().textContent = produit;
            row.insertCell().textContent = details.quantite;
            row.insertCell().textContent = details.prixAchat;
            row.insertCell().textContent = details.prixVenteDetail;
            row.insertCell().textContent = details.prixVenteGros;
            const actionsCell = row.insertCell();
            const modifierButton = document.createElement('button');
            modifierButton.textContent = 'Modifier';
            modifierButton.addEventListener('click', () => {
                 // Remplir le formulaire de stock avec les données actuelles du produit
                document.getElementById('produitStock').value = produit;
                document.getElementById('quantiteStock').value = details.quantite;
                document.getElementById('prixAchat').value = details.prixAchat;
                // Optionnel : Modifier le bouton pour indiquer une mise à jour
                stockForm.querySelector('button[type="submit"]').textContent = 'Mettre à jour';

                // Optionnel : Ajouter un identifiant unique au formulaire pour savoir quel produit modifier
                stockForm.dataset.produit = produit;
            });
            actionsCell.appendChild(modifierButton);

            const supprimerButton = document.createElement('button');
            supprimerButton.textContent = 'Supprimer';
            supprimerButton.addEventListener('click', () => {
                if (confirm(`Êtes-vous sûr de vouloir supprimer ${produit} du stock?`)) {
                    supprimerProduitDuStock(produit, boutique);
                }
            });
            actionsCell.appendChild(supprimerButton);
        });
    });
}
// Fonction pour supprimer un produit du stock
function supprimerProduitDuStock(produit, boutique) {
    const stockRef = database.ref(`stock/${boutique}/${produit}`);
    stockRef.remove()
    .then(() => {
        alert(`${produit} supprimé du stock avec succès!`);
        chargerStock(boutique); // Recharger le stock
    })
    .catch(error => {
        console.error("Erreur lors de la suppression du produit du stock:", error);
        alert("Erreur lors de la suppression du produit du stock.");
    });
}

// Charger le stock au chargement de la page
chargerStock('Boutique1'); // Charger le stock de la boutique par défaut

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
});

// Fonction pour charger les données de toutes les boutiques
function chargerStockToutesBoutiques() {
    stockTable.innerHTML = ''; // Vider le tableau
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
    boutiques.forEach(boutique => {
        const stockRef = database.ref(`stock/${boutique}`);
        stockRef.once('value', (snapshot) => {
            snapshot.forEach(childSnapshot => {
                const produit = childSnapshot.key;
                const details = childSnapshot.val();
                const row = stockTable.insertRow();
                row.insertCell().textContent = `${boutique} - ${produit}`;
                row.insertCell().textContent = details.quantite;
                row.insertCell().textContent = details.prixAchat;
                row.insertCell().textContent = details.prixVenteDetail;
                row.insertCell().textContent = details.prixVenteGros;
                row.insertCell().textContent = 'Non applicable'; // Actions non applicables en mode "Toutes les boutiques"
            });
        });
    });
}

// Fonction pour charger les bénéfices
function chargerBenefices(boutique) {
     beneficesTable.innerHTML = ''; // Vider le tableau
    if (boutique === 'Toutes') {
       
        const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
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

        ventesRef.once('value', (snapshot) => {
            const ventes = snapshot.val();
            let depenses = 0;
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
                            depenses += vente.quantite * stock.prixAchat;
                            const benefice = vente.prixTotal - (vente.quantite * stock.prixAchat);

                            if (!benefices[vente.produit]) {
                                benefices[vente.produit] = 0;
                            }
                            benefices[vente.produit] += benefice;
                        }

                        // Enregistrer le bénéfice dans la base de données
                        const beneficeRef = database.ref(`benefices/${boutique}/${vente.date}`);
                        beneficeRef.transaction((currentBenefice) => {
                            if (!currentBenefice) {
                                currentBenefice = { total: 0 };
                            }
                            currentBenefice.total += benefice;
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

            // Résoudre la promesse avec les bénéfices, le total des ventes et les dépenses
            resolve({ benefices, totalVentes, depenses });
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
        alert('Vente marquée comme payée avec succès!');
        chargerRecouvrements(boutique); // Recharger les recouvrements
    })
    .catch(error => {
        console.error("Erreur lors de la mise à jour du statut de paiement:", error);
        alert("Erreur lors de la mise à jour du statut de paiement.");
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
}

// Charger les recouvrements au chargement de la page
chargerRecouvrements('Boutique1'); // Charger les recouvrements de la boutique par défaut
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
chargerVentesDuJour('Boutique1'); // Charger les ventes du jour de la boutique par défaut
chargerAlertesStock('Boutique1'); // Charger les alertes de stock de la boutique par défaut

// Gestion de la vérification IMEI
verifierImeiButton.addEventListener('click', () => {
    const imeiAVerifier = imeiAVerifierInput.value;
    const boutiques = ['Boutique1', 'Boutique2', 'Boutique3'];
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

// Appeler la fonction pour initialiser le graphique
updateVentesChart('Boutique1'); // Mettre à jour le graphique pour la boutique par défaut