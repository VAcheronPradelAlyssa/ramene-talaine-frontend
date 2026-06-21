describe('Page paramètres du compte', () => {
  describe('utilisateur INDIVIDUAL (non Pro)', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/#/account-settings');
    });

    it('affiche la section Compte Professionnel avec le bouton de demande', () => {
      cy.contains('Compte Professionnel').should('be.visible');
      cy.contains('Demander un compte Pro').should('be.visible');
    });

    it('ne montre pas le badge PRO actif', () => {
      cy.get('.badge-pro').should('not.exist');
    });

    it('affiche un message de succès après demande Pro', () => {
      cy.fixture('users/me-pro').then((proUser) => {
        cy.intercept('POST', '**/api/users/me/upgrade-pro', {
          statusCode: 200,
          body: proUser,
        }).as('requestPro');
      });

      cy.contains('Demander un compte Pro').click();
      cy.wait('@requestPro');
      cy.contains('demande').should('be.visible');
    });

    it('affiche le bouton de suppression de compte', () => {
      cy.contains('Supprimer mon compte').should('be.visible');
    });

    it('affiche la confirmation après clic sur supprimer', () => {
      cy.contains('Supprimer mon compte').click();
      cy.contains('irréversible').should('be.visible');
      cy.contains('Annuler').should('be.visible');
      cy.contains('Oui, supprimer').should('be.visible');
    });

    it('masque la confirmation après clic sur Annuler', () => {
      cy.contains('Supprimer mon compte').click();
      cy.contains('Annuler').click();
      cy.contains('irréversible').should('not.exist');
    });

    it('appelle l\'API et redirige vers / après confirmation de suppression', () => {
      cy.intercept('DELETE', '**/api/users/me', {
        statusCode: 204,
        body: {},
      }).as('deleteAccount');

      cy.contains('Supprimer mon compte').click();
      cy.contains('Oui, supprimer').click();

      cy.wait('@deleteAccount');
      cy.location('hash').should('eq', '#/');
    });
  });

  describe('utilisateur PRO', () => {
    beforeEach(() => {
      cy.login({ pro: true });
      cy.visit('/#/account-settings');
    });

    it('affiche le badge PRO actif', () => {
      cy.get('.badge-pro').should('be.visible').and('contain', 'PRO');
    });

    it('n\'affiche pas le bouton de demande Pro', () => {
      cy.contains('Demander un compte Pro').should('not.exist');
    });
  });
});
