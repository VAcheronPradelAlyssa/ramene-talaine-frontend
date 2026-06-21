describe('Page mot de passe oublié', () => {
  beforeEach(() => {
    cy.visit('/#/forgot-password');
  });

  it('affiche le champ email et le bouton d\'envoi', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('le bouton est désactivé si l\'email est invalide', () => {
    cy.get('input[type="email"]').type('pasunemail');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('affiche un message de succès après envoi', () => {
    cy.intercept('POST', '**/api/auth/forgot-password', {
      statusCode: 200,
      body: {},
    }).as('forgotPassword');

    cy.get('input[type="email"]').type('alyssa@ramene.fr');
    cy.get('button[type="submit"]').click();

    cy.wait('@forgotPassword');
    cy.contains('Email envoyé').should('be.visible');
  });

  it('affiche une erreur si l\'API échoue', () => {
    cy.intercept('POST', '**/api/auth/forgot-password', {
      statusCode: 404,
      body: { message: 'Aucun compte associé à cet email.' },
    }).as('forgotFail');

    cy.get('input[type="email"]').type('inconnu@ramene.fr');
    cy.get('button[type="submit"]').click();

    cy.wait('@forgotFail');
    cy.contains('Aucun compte associé').should('be.visible');
  });

  it('affiche le lien retour vers la connexion', () => {
    cy.contains('a', 'Retour à la connexion').should('be.visible').click();
    cy.location('hash').should('include', 'connexion');
  });
});
