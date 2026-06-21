describe('Page édition du profil', () => {
  beforeEach(() => {
    cy.login();
    cy.fixture('users/me').then((user) => {
      cy.intercept('GET', '**/api/users/me', { statusCode: 200, body: user }).as('getProfile');
    });
    cy.visit('/#/edit-profile');
    cy.wait('@getProfile');
  });

  it('affiche le formulaire avec les données actuelles pré-remplies', () => {
    cy.get('input[formControlName="prenom"]').should('have.value', 'Alyssa');
    cy.get('input[formControlName="nom"]').should('have.value', 'Vacheron');
    cy.get('input[formControlName="surnom"]').should('have.value', 'alyssav');
    cy.get('input[formControlName="ville"]').should('have.value', 'Lyon');
  });

  it('affiche un message d\'erreur si prénom est trop court', () => {
    cy.get('input[formControlName="prenom"]').clear().type('A').blur();
    cy.contains('Minimum 2').should('be.visible');
  });

  it('affiche le compteur de caractères de la bio', () => {
    cy.get('textarea[formControlName="bio"]').clear().type('Mon texte de bio');
    cy.contains('/ 500').should('be.visible');
  });

  it('affiche une prévisualisation d\'avatar quand une URL est saisie', () => {
    cy.get('input[formControlName="avatarUrl"]').type('https://picsum.photos/100');
    cy.get('.avatar-img').should('be.visible');
  });

  it('affiche un message de succès après sauvegarde', () => {
    cy.fixture('users/me').then((user) => {
      cy.intercept('PATCH', '**/api/users/me', {
        statusCode: 200,
        body: { ...user, ville: 'Marseille' },
      }).as('updateProfile');
    });

    cy.get('input[formControlName="ville"]').clear().type('Marseille');
    cy.get('button[type="submit"]').click();

    cy.wait('@updateProfile');
    cy.contains('mis à jour').should('be.visible');
  });

  it('affiche une erreur si l\'API échoue', () => {
    cy.intercept('PATCH', '**/api/users/me', {
      statusCode: 500,
      body: { message: 'Erreur serveur.' },
    }).as('updateFail');

    cy.get('button[type="submit"]').click();

    cy.wait('@updateFail');
    cy.contains('Erreur').should('be.visible');
  });

  it('le bouton Annuler navigue vers /profile', () => {
    cy.contains('button', 'Annuler').click();
    cy.location('hash').should('include', 'profile');
  });
});
