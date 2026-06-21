describe('Page changement de mot de passe', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/#/change-password');
  });

  it('affiche les 3 champs et le bouton soumettre', () => {
    cy.get('input[formControlName="oldPassword"]').should('be.visible');
    cy.get('input[formControlName="newPassword"]').should('be.visible');
    cy.get('input[formControlName="confirmPassword"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('affiche une erreur si le nouveau mot de passe est trop court', () => {
    cy.get('input[formControlName="newPassword"]').type('abc').blur();
    cy.contains('Minimum 8').should('be.visible');
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', () => {
    cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
    cy.get('input[formControlName="confirmPassword"]').type('AutreMdp999!').blur();
    cy.contains('ne correspondent pas').should('be.visible');
  });

  it('le toggle afficher/masquer fonctionne sur le champ nouveau mot de passe', () => {
    cy.get('input[formControlName="newPassword"]').should('have.attr', 'type', 'password');
    cy.get('.toggle-pwd').first().click();
    // Le premier toggle correspond à oldPassword, le deuxième à newPassword
    cy.get('.toggle-pwd').eq(1).click();
    cy.get('input[formControlName="newPassword"]').should('have.attr', 'type', 'text');
  });

  it('affiche une erreur si l\'ancien mot de passe est incorrect', () => {
    cy.intercept('PUT', '**/api/users/me/password', {
      statusCode: 400,
      body: { message: 'Mot de passe actuel incorrect.' },
    }).as('changePwdFail');

    cy.get('input[formControlName="oldPassword"]').type('MauvaisAncienMdp');
    cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
    cy.get('input[formControlName="confirmPassword"]').type('NouveauMdp123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@changePwdFail');
    cy.contains('incorrect').should('be.visible');
  });

  it('affiche un message de succès et remet le formulaire à zéro', () => {
    cy.intercept('PUT', '**/api/users/me/password', {
      statusCode: 200,
      body: {},
    }).as('changePwdSuccess');

    cy.get('input[formControlName="oldPassword"]').type('AncienMdp123!');
    cy.get('input[formControlName="newPassword"]').type('NouveauMdp123!');
    cy.get('input[formControlName="confirmPassword"]').type('NouveauMdp123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@changePwdSuccess');
    cy.contains('modifié').should('be.visible');
    cy.get('input[formControlName="oldPassword"]').should('have.value', '');
  });

  it('le bouton Annuler navigue vers /profile', () => {
    cy.contains('button', 'Annuler').click();
    cy.location('hash').should('include', 'profile');
  });
});
