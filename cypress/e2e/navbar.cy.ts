describe('Navbar', () => {
  describe('utilisateur non connecté', () => {
    beforeEach(() => {
      cy.visit('/#/');
    });

    it('affiche les liens Connexion et Inscription', () => {
      cy.contains('a', 'Connexion').should('be.visible');
      cy.contains('a', 'Inscription').should('be.visible');
    });

    it('n\'affiche pas le bouton de menu utilisateur', () => {
      cy.get('.user-button').should('not.exist');
    });

    it('n\'affiche pas le bouton Publier', () => {
      cy.contains('button', 'Publier').should('not.exist');
    });
  });

  describe('utilisateur connecté', () => {
    beforeEach(() => {
      cy.login();
      cy.visit('/#/');
    });

    it('affiche le bouton Publier', () => {
      cy.contains('Publier').should('be.visible');
    });

    it('n\'affiche pas les liens Connexion / Inscription', () => {
      cy.contains('a', 'Connexion').should('not.exist');
    });

    it('affiche le bouton du menu utilisateur', () => {
      cy.get('.user-button').should('be.visible');
    });

    it('le menu utilisateur contient les liens principaux', () => {
      cy.get('.user-button').click();
      cy.contains('Mon profil').should('be.visible');
      cy.contains('Mes annonces').should('be.visible');
    });

    it('le menu utilisateur contient les liens de gestion du compte', () => {
      cy.get('.user-button').click();
      cy.contains('Modifier mon profil').should('be.visible');
      cy.contains('Changer mon mot de passe').should('be.visible');
      cy.contains('Paramètres du compte').should('be.visible');
    });

    it('le lien "Mon profil" navigue vers /profile', () => {
      cy.fixture('users/me').then((user) => {
        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: user }).as('getProfile');
      });
      cy.get('.user-button').click();
      cy.contains('Mon profil').click();
      cy.location('hash').should('include', 'profile');
    });

    it('la déconnexion vide le localStorage et affiche le bouton Connexion', () => {
      cy.get('.user-button').click();
      cy.contains('Déconnexion').click();

      cy.window().its('localStorage').invoke('getItem', 'auth_token').should('be.null');
      cy.window().its('localStorage').invoke('getItem', 'auth_user').should('be.null');
      cy.contains('a', 'Connexion').should('be.visible');
    });
  });

  describe('utilisateur PRO connecté', () => {
    beforeEach(() => {
      cy.login({ pro: true });
      cy.visit('/#/');
    });

    it('affiche le menu utilisateur', () => {
      cy.get('.user-button').should('be.visible');
    });
  });
});
