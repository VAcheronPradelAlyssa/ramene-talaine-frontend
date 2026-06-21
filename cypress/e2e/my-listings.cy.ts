describe('Page mes annonces (/mes-annonces)', () => {
  describe('avec des annonces', () => {
    beforeEach(() => {
      cy.login();
      cy.fixture('listings/mine').then((listings) => {
        cy.intercept('GET', '**/api/listings/me', { statusCode: 200, body: listings }).as('getMyListings');
      });
      cy.visit('/#/mes-annonces');
      cy.wait('@getMyListings');
    });

    it('affiche mes annonces', () => {
      cy.get('.listing-card').should('have.length', 2);
    });

    it('affiche les titres des annonces', () => {
      cy.contains('Pelote Drops Karisma bleue').should('be.visible');
      cy.contains('Aiguilles Addi circulaires').should('be.visible');
    });

    it('affiche le bouton Modifier pour chaque annonce', () => {
      cy.get('.edit-btn').should('have.length', 2);
    });

    it('affiche le bouton Supprimer pour chaque annonce', () => {
      cy.get('.delete-btn').should('have.length', 2);
    });

    it('le bouton Modifier navigue vers /edit-listing/:id', () => {
      cy.get('.edit-btn').first().click();
      cy.location('hash').should('include', 'edit-listing/10');
    });

    it('supprime une annonce après confirmation', () => {
      cy.intercept('DELETE', '**/api/listings/10', { statusCode: 204, body: {} }).as('deleteListing');

      cy.fixture('listings/mine').then((listings) => {
        cy.intercept('GET', '**/api/listings/me', {
          statusCode: 200,
          body: [listings[1]],
        }).as('getMyListingsAfterDelete');
      });

      cy.on('window:confirm', () => true);
      cy.get('.delete-btn').first().click();

      cy.wait('@deleteListing');
      cy.wait('@getMyListingsAfterDelete');
      cy.get('.listing-card').should('have.length', 1);
    });

    it('ne supprime pas si la confirmation est refusée', () => {
      cy.on('window:confirm', () => false);
      cy.get('.delete-btn').first().click();
      cy.get('.listing-card').should('have.length', 2);
    });
  });

  describe('sans annonces', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', '**/api/listings/me', { statusCode: 200, body: [] }).as('getMyListings');
      cy.visit('/#/mes-annonces');
      cy.wait('@getMyListings');
    });

    it('affiche un message vide', () => {
      cy.contains('Aucune annonce').should('be.visible');
    });
  });

  describe('erreur API', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', '**/api/listings/me', { statusCode: 500 }).as('getMyListingsFail');
      cy.visit('/#/mes-annonces');
      cy.wait('@getMyListingsFail');
    });

    it('affiche un message d\'erreur', () => {
      cy.contains('Erreur').should('be.visible');
    });
  });
});
