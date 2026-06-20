describe('Formulaire d\'inscription', () => {
  beforeEach(() => {
    cy.visit('/#/inscription');
  });

  it('affiche une erreur si l\'email est déjà utilisé', () => {
    cy.intercept('POST', '**/api/auth/register', {
      delayMs: 12000,
      statusCode: 409,
      body: {
        field: 'email',
        message: 'Email déjà utilisé',
      },
    });

    cy.get('input[name="prenom"]').type('Alyssa');
    cy.get('input[name="nom"]').type('Vacheron');
    cy.get('input[name="email"]').type('deja@utilise.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="surnom"]').type('nouvelutilisateur');
    cy.get('form').submit();

    cy.contains('.error', 'Email déjà utilisé', { timeout: 20000 }).should('be.visible');
    cy.url().should('include', '/inscription');
  });

  it('affiche une suggestion si le surnom est déjà pris', () => {
    cy.intercept('POST', '**/api/auth/register', {
      delayMs: 12000,
      statusCode: 409,
      body: {
        field: 'username',
        message: 'Surnom déjà utilisé',
        suggestion: 'noupie1',
      },
    }).as('registerUsernameTaken');

    cy.get('input[name="prenom"]').type('Bob');
    cy.get('input[name="nom"]').type('Martin');
    cy.get('input[name="email"]').type('nouvel@email.com');
    cy.get('input[name="password"]').type('Password123!');
    cy.get('input[name="surnom"]').type('noupie');
    cy.get('form').submit();

    cy.wait('@registerUsernameTaken', { timeout: 20000 });
    cy.contains('.error', 'Surnom déjà utilisé', { timeout: 20000 }).should('be.visible');
    cy.get('.suggestion-btn').should('be.visible').and('contain', 'noupie1');
  });

  it('remplit automatiquement le champ surnom si on clique sur la suggestion', () => {
    cy.intercept('POST', '**/api/auth/register', {
      delayMs: 12000,
      statusCode: 409,
      body: {
        field: 'username',
        message: 'Surnom déjà utilisé',
        suggestion: 'noupie1',
      },
    }).as('registerWithSuggestion');

    cy.get('input[name="prenom"]').type('Marco');
    cy.get('input[name="nom"]').type('Testeur');
    cy.get('input[name="email"]').type('unique@email.com');
    cy.get('input[name="password"]').type('Test1234!');
    cy.get('input[name="surnom"]').type('noupie');
    cy.get('form').submit();

    cy.wait('@registerWithSuggestion', { timeout: 20000 });
    cy.get('.suggestion-btn').should('be.visible').click();
    cy.get('input[name="surnom"]').should('have.value', 'noupie1');
  });

  it('inscrit un nouvel utilisateur si tout est bon', () => {
    const rand = Math.floor(Math.random() * 1000000);

    cy.intercept('POST', '**/api/auth/register', {
      statusCode: 201,
      body: {
        token: 'test-token',
        user: {
          prenom: 'Tester',
          nom: 'Random',
          email: `test${rand}@email.com`,
          username: `nouveauname${rand}`,
          ville: '',
        },
      },
    }).as('registerSuccess');

    cy.get('input[name="prenom"]').type('Tester');
    cy.get('input[name="nom"]').type('Random');
    cy.get('input[name="email"]').type(`test${rand}@email.com`);
    cy.get('input[name="password"]').type('PwdValid123!');
    cy.get('input[name="surnom"]').type(`nouveauname${rand}`);
    cy.get('form').submit();

    cy.wait('@registerSuccess', { timeout: 20000 });
    cy.location('hash').should('eq', '#/');
    cy.window().its('localStorage').invoke('getItem', 'auth_token').should('eq', 'test-token');
  });

});