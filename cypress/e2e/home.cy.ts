describe("Page d'accueil", () => {
  beforeEach(() => {
    cy.visit('/#/');
  });

  it('affiche le logo', () => {
    cy.get('img[alt="Ramene ta Laine"]').should('be.visible');
  });

  it('affiche les boutons Connexion et Inscription quand non connecté', () => {
    cy.contains('a', 'Connexion').should('be.visible');
    cy.contains('a', 'Inscription').should('be.visible');
  });

  it("le bouton Inscription navigue vers /inscription", () => {
    cy.contains('a', 'Inscription').first().click();
    cy.location('hash').should('include', 'inscription');
  });

  it("le bouton Connexion navigue vers /connexion", () => {
    cy.contains('a', 'Connexion').first().click();
    cy.location('hash').should('include', 'connexion');
  });
});
