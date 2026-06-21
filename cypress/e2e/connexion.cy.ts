describe('Page de connexion', () => {
  beforeEach(() => {
    cy.visit('/#/connexion');
  });

  it('affiche le formulaire de connexion', () => {
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('le bouton est désactivé si les champs sont vides', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('affiche le lien "Mot de passe oublié ?"', () => {
    cy.contains('a', 'Mot de passe oublié').should('be.visible');
  });

  it('le lien "Mot de passe oublié" navigue vers /forgot-password', () => {
    cy.contains('a', 'Mot de passe oublié').click();
    cy.location('hash').should('include', 'forgot-password');
  });

  it('affiche une erreur en cas de mauvais identifiants', () => {
    cy.intercept('POST', '**/api/auth/login', {
      statusCode: 401,
      body: { message: 'Email ou mot de passe incorrect.' },
    }).as('loginFail');

    cy.get('input[name="email"]').type('mauvais@email.fr');
    cy.get('input[name="password"]').type('mauvaismdp');
    cy.get('form').submit();

    cy.wait('@loginFail');
    cy.contains('Email ou mot de passe incorrect.').should('be.visible');
    cy.location('hash').should('include', 'connexion');
  });

  it('redirige vers / après une connexion réussie', () => {
    cy.fixture('users/me').then((user) => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: { token: 'fake-jwt-token-for-tests', user },
      }).as('loginSuccess');
    });

    cy.get('input[name="email"]').type('alyssa@ramene.fr');
    cy.get('input[name="password"]').type('MotDePasse123!');
    cy.get('form').submit();

    cy.wait('@loginSuccess');
    cy.location('hash').should('eq', '#/');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('eq', 'fake-jwt-token-for-tests');
  });
});
