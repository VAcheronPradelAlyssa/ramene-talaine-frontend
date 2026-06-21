/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Injecte un utilisateur factice dans localStorage pour simuler la connexion. */
      login(options?: { pro?: boolean }): Chainable<void>;
      /** Intercepte toutes les API de référence (brands, colors, compositions). */
      interceptRefData(): Chainable<void>;
    }
  }
}

const BASE_USER = {
  id: '1',
  prenom: 'Alyssa',
  nom: 'Vacheron',
  email: 'alyssa@ramene.fr',
  surnom: 'alyssav',
  username: 'alyssav',
  ville: 'Lyon',
  bio: 'Passionnée de tricot et crochet.',
  avatarUrl: null,
  accountType: 'INDIVIDUAL',
  emailVerified: true,
  createdAt: '2025-01-15T10:00:00Z',
};

const PRO_USER = {
  id: '2',
  prenom: 'Sophie',
  nom: 'Marchand',
  email: 'sophie@boutique.fr',
  surnom: 'sophiem',
  username: 'sophiem',
  ville: 'Paris',
  bio: 'Boutique de laines artisanales.',
  avatarUrl: 'https://picsum.photos/seed/sophie/100',
  accountType: 'PRO',
  emailVerified: true,
  createdAt: '2024-06-01T08:00:00Z',
};

Cypress.Commands.add('login', (options = {}) => {
  const user = options.pro ? PRO_USER : BASE_USER;
  localStorage.setItem('auth_token', 'fake-jwt-token-for-tests');
  localStorage.setItem('auth_user', JSON.stringify(user));
});

Cypress.Commands.add('interceptRefData', () => {
  cy.fixture('brands').then((brands) => {
    cy.intercept('GET', '**/api/brands', { statusCode: 200, body: brands }).as('getBrands');
  });
  cy.fixture('colors').then((colors) => {
    cy.intercept('GET', '**/api/colors', { statusCode: 200, body: colors }).as('getColors');
  });
  cy.fixture('compositions').then((compositions) => {
    cy.intercept('GET', '**/api/compositions', { statusCode: 200, body: compositions }).as('getCompositions');
  });
});

export {};
