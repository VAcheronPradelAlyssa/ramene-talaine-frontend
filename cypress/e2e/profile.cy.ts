describe('Page profil (Mon profil)', () => {
  describe('utilisateur sans avatar (INDIVIDUAL)', () => {
    beforeEach(() => {
      cy.login();
      cy.fixture('users/me').then((user) => {
        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: user }).as('getProfile');
      });
      cy.visit('/#/profile');
      cy.wait('@getProfile');
    });

    it('affiche le prénom et le nom', () => {
      cy.contains('Alyssa').should('be.visible');
      cy.contains('Vacheron').should('be.visible');
    });

    it('affiche le surnom', () => {
      cy.contains('@alyssav').should('be.visible');
    });

    it('affiche les initiales en guise d\'avatar', () => {
      cy.get('.avatar-initials').should('be.visible').and('contain', 'AV');
    });

    it('n\'affiche pas de badge PRO', () => {
      cy.get('.badge-pro').should('not.exist');
    });

    it('affiche les 4 cartes d\'action', () => {
      cy.contains('Modifier mon profil').should('be.visible');
      cy.contains('Changer mon mot de passe').should('be.visible');
      cy.contains('Mes annonces').should('be.visible');
      cy.contains('Paramètres du compte').should('be.visible');
    });

    it('la carte "Modifier mon profil" navigue vers /edit-profile', () => {
      cy.contains('Modifier mon profil').click();
      cy.location('hash').should('include', 'edit-profile');
    });

    it('la carte "Paramètres du compte" navigue vers /account-settings', () => {
      cy.contains('Paramètres du compte').click();
      cy.location('hash').should('include', 'account-settings');
    });

    it('affiche la ville', () => {
      cy.contains('Lyon').should('be.visible');
    });

    it('affiche la bio', () => {
      cy.contains('Passionnée de tricot').should('be.visible');
    });
  });

  describe('utilisateur avec avatar et badge PRO', () => {
    beforeEach(() => {
      cy.login({ pro: true });
      cy.fixture('users/me-pro').then((user) => {
        cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: user }).as('getProfile');
      });
      cy.visit('/#/profile');
      cy.wait('@getProfile');
    });

    it('affiche l\'image d\'avatar', () => {
      cy.get('.avatar-img').should('be.visible');
    });

    it('affiche le badge PRO', () => {
      cy.get('.badge-pro').should('be.visible').and('contain', 'PRO');
    });
  });

  describe('erreur de chargement', () => {
    beforeEach(() => {
      cy.login();
      cy.intercept('GET', '**/api/users/me', { statusCode: 500, body: {} }).as('getProfileFail');
      cy.visit('/#/profile');
      cy.wait('@getProfileFail');
    });

    it('affiche un message d\'erreur', () => {
      cy.contains('Erreur').should('be.visible');
    });
  });
});
