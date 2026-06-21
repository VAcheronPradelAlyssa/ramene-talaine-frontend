describe('Page détail d\'une annonce (/annonces/:id)', () => {
  describe('annonce trouvée', () => {
    beforeEach(() => {
      cy.fixture('listings/detail').then((listing) => {
        cy.intercept('GET', '**/api/listings/10', { statusCode: 200, body: listing }).as('getListing');
        cy.intercept('GET', '**/api/listings', { statusCode: 200, body: [listing] }).as('getAllListings');
      });
      cy.intercept('GET', '**/api/compositions', { statusCode: 200, body: [] }).as('getCompositions');
      cy.visit('/#/annonces/10');
      cy.wait('@getListing');
    });

    it('affiche le titre de l\'annonce', () => {
      cy.contains('Pelote Drops Karisma bleue').should('be.visible');
    });

    it('affiche la description', () => {
      cy.contains('Pelote neuve, jamais utilisée').should('be.visible');
    });

    it('affiche le prix pour une annonce de vente', () => {
      cy.contains('4.5').should('be.visible');
    });

    it('affiche la localisation', () => {
      cy.contains('Lyon').should('be.visible');
    });

    it('affiche le vendeur', () => {
      cy.contains('alyssav').should('be.visible');
    });

    it('affiche la marque', () => {
      cy.contains('Drops').should('be.visible');
    });

    it('affiche la couleur', () => {
      cy.contains('Bleu').should('be.visible');
    });
  });

  describe('annonce introuvable', () => {
    beforeEach(() => {
      cy.intercept('GET', '**/api/listings/999', { statusCode: 404, body: {} }).as('getListingFail');
      cy.intercept('GET', '**/api/listings', { statusCode: 200, body: [] }).as('getAllListings');
      cy.intercept('GET', '**/api/compositions', { statusCode: 200, body: [] }).as('getCompositions');
      cy.visit('/#/annonces/999');
      cy.wait('@getListingFail');
    });

    it('affiche un message d\'erreur', () => {
      cy.contains('introuvable').should('be.visible');
    });
  });
});
