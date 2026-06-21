describe('Page des annonces (/listings)', () => {
  beforeEach(() => {
    cy.login();
    cy.fixture('listings/all').then((listings) => {
      cy.intercept('GET', '**/api/listings', { statusCode: 200, body: listings }).as('getListings');
    });
    cy.visit('/#/listings');
    cy.wait('@getListings');
  });

  it('affiche la liste des annonces', () => {
    cy.get('.listing-card').should('have.length', 3);
  });

  it('affiche les titres des annonces', () => {
    cy.contains('Pelote Drops Karisma bleue').should('be.visible');
    cy.contains('Crochet Clover 4mm').should('be.visible');
    cy.contains('Livre Tricot pour débutants').should('be.visible');
  });

  it('affiche le label "Don" pour les annonces gratuites', () => {
    cy.contains('Don').should('be.visible');
  });

  it('affiche le label "Echange" pour les échanges', () => {
    cy.contains('Echange').should('be.visible');
  });

  it('affiche le prix pour les annonces de vente', () => {
    cy.contains('4.5').should('be.visible');
  });

  it('un clic sur une annonce navigue vers /annonces/:id', () => {
    cy.get('.listing-card').first().click();
    cy.location('hash').should('include', 'annonces');
  });

  it('affiche un message d\'erreur si l\'API échoue', () => {
    cy.intercept('GET', '**/api/listings', {
      statusCode: 500,
      body: { message: 'Erreur serveur.' },
    }).as('getListingsFail');

    cy.visit('/#/listings');
    cy.wait('@getListingsFail');
    cy.contains('Erreur').should('be.visible');
  });
});
