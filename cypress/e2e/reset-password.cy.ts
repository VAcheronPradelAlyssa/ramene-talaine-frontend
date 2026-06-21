describe('Page réinitialisation de mot de passe', () => {
  it('affiche un état invalide sans token dans l\'URL', () => {
    cy.visit('/#/reset-password');
    cy.contains('Lien invalide').should('be.visible');
    cy.get('form').should('not.exist');
  });

  describe('avec token valide dans l\'URL', () => {
    beforeEach(() => {
      cy.visit('/#/reset-password?token=valid-reset-token');
    });

    it('affiche le formulaire de réinitialisation', () => {
      cy.get('input[formControlName="newPassword"]').should('be.visible');
      cy.get('input[formControlName="confirmPassword"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('le bouton est désactivé si les champs sont vides', () => {
      cy.get('button[type="submit"]').should('be.disabled');
    });

    it('affiche une erreur si les mots de passe ne correspondent pas', () => {
      cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
      cy.get('input[formControlName="confirmPassword"]').type('AutreMdp999!').blur();
      cy.contains('ne correspondent pas').should('be.visible');
    });

    it('affiche une erreur si le mot de passe est trop court', () => {
      cy.get('input[formControlName="newPassword"]').type('abc').blur();
      cy.contains('Minimum 8').should('be.visible');
    });

    it('affiche le succès après soumission valide', () => {
      cy.intercept('POST', '**/api/auth/reset-password', {
        statusCode: 200,
        body: {},
      }).as('resetPassword');

      cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
      cy.get('input[formControlName="confirmPassword"]').type('NouveauMdp123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetPassword');
      cy.contains('réinitialisé').should('be.visible');
    });

    it('affiche une erreur si le token est expiré', () => {
      cy.intercept('POST', '**/api/auth/reset-password', {
        statusCode: 400,
        body: { message: 'Le lien est invalide ou a expiré.' },
      }).as('resetFail');

      cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
      cy.get('input[formControlName="confirmPassword"]').type('NouveauMdp123!');
      cy.get('button[type="submit"]').click();

      cy.wait('@resetFail');
      cy.contains('expiré').should('be.visible');
    });
  });
});
