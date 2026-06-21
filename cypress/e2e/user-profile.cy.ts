describe('Profil public (/utilisateur/:id)', () => {
  describe('utilisateur introuvable', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/users/42', { statusCode: 404, body: {} }).as('getUser');
      cy.intercept('GET', '**/api/users/42/listings', { statusCode: 404, body: [] }).as('getUserListings');
      cy.visit('/#/utilisateur/42');
      cy.wait('@getUser');
    });

    it('affiche un message d\'erreur', () => {
      cy.contains('introuvable').should('be.visible');
    });
  });

  describe('utilisateur valide sans avatar', () => {
    beforeEach(() => {
      cy.fixture('users/public').then((user) => {
        cy.intercept('GET', '**/api/users/42', { statusCode: 200, body: user }).as('getUser');
      });
      cy.fixture('listings/all').then((listings) => {
        cy.intercept('GET', '**/api/users/42/listings', { statusCode: 200, body: listings.slice(0, 2) }).as('getUserListings');
      });
      cy.visit('/#/utilisateur/42');
      cy.wait('@getUser');
    });

    it('affiche le prénom et le nom', () => {
      cy.contains('Marie').should('be.visible');
      cy.contains('Dupont').should('be.visible');
    });

    it('affiche le surnom', () => {
      cy.contains('@mariescrochet').should('be.visible');
    });

    it('affiche les initiales en guise d\'avatar', () => {
      cy.get('.avatar-initials').should('be.visible').and('contain', 'MD');
    });

    it('affiche la ville', () => {
      cy.contains('Bordeaux').should('be.visible');
    });

    it('affiche la bio', () => {
      cy.contains('granny square').should('be.visible');
    });

    it('n\'affiche pas le badge PRO', () => {
      cy.get('.badge-pro').should('not.exist');
    });

    it('affiche les annonces de l\'utilisateur', () => {
      cy.wait('@getUserListings');
      cy.get('.listing-card').should('have.length.at.least', 1);
    });
  });

  describe('utilisateur PRO avec avatar', () => {
    beforeEach(() => {
      cy.fixture('users/me-pro').then((user) => {
        cy.intercept('GET', '**/api/users/2', { statusCode: 200, body: user }).as('getUser');
        cy.intercept('GET', '**/api/users/2/listings', { statusCode: 200, body: [] }).as('getUserListings');
      });
      cy.visit('/#/utilisateur/2');
      cy.wait('@getUser');
    });

    it('affiche l\'image d\'avatar', () => {
      cy.get('.avatar-img').should('be.visible');
    });

    it('affiche le badge PRO', () => {
      cy.get('.badge-pro').should('be.visible').and('contain', 'PRO');
    });

    it('affiche le message vide si aucune annonce', () => {
      cy.wait('@getUserListings');
      cy.contains('Aucune annonce').should('be.visible');
    });
  });
});
