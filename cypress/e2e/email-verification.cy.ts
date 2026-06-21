describe('Page vérification email', () => {
  it('affiche un état invalide sans token dans l\'URL', () => {
    cy.visit('/#/verify-email');
    cy.contains('Lien invalide').should('be.visible');
    cy.contains('Se connecter').should('be.visible');
  });

  it('affiche le succès avec un token valide', () => {
    cy.intercept('POST', '**/api/auth/verify-email', {
      statusCode: 200,
      body: {},
    }).as('verifyEmail');

    cy.visit('/#/verify-email?token=valid-token-abc');

    cy.wait('@verifyEmail');
    cy.contains('Email vérifié').should('be.visible');
    cy.contains('Se connecter').should('be.visible');
  });

  it('affiche une erreur si le token est invalide', () => {
    cy.intercept('POST', '**/api/auth/verify-email', {
      statusCode: 400,
      body: { message: 'Token invalide ou expiré.' },
    }).as('verifyFail');

    cy.visit('/#/verify-email?token=bad-token');

    cy.wait('@verifyFail');
    cy.contains('Lien invalide').should('be.visible');
  });

  it('le lien "Aller à la connexion" fonctionne', () => {
    cy.intercept('POST', '**/api/auth/verify-email', { statusCode: 400, body: {} });
    cy.visit('/#/verify-email?token=x');
    cy.contains('a', 'connexion').click();
    cy.location('hash').should('include', 'connexion');
  });
});
