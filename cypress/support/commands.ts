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

type AuthPayload = { user: typeof BASE_USER | typeof PRO_USER; token: string };

// cy.login() stocke les données d'auth que le prochain cy.visit() injecte via
// onBeforeLoad — avant qu'Angular démarre — garantissant que AuthService
// lit le bon utilisateur dès son constructeur, sans zone/detectChanges nécessaire.
let _pendingAuth: AuthPayload | null = null;

Cypress.Commands.add('login', (options = {}) => {
  _pendingAuth = {
    user: options.pro ? PRO_USER : BASE_USER,
    token: 'fake-jwt-token-for-tests',
  };
});

// Surcharge cy.visit : si un cy.login() précédent a stocké des données d'auth,
// on les injecte dans le localStorage de l'AUT avant que la page se charge.
Cypress.Commands.overwrite(
  'visit',
  (
    originalFn: (...args: unknown[]) => Cypress.Chainable<Cypress.AUTWindow>,
    url: string,
    options: Partial<Cypress.VisitOptions> = {}
  ) => {
    if (_pendingAuth) {
      const auth = _pendingAuth;
      _pendingAuth = null;
      const existingBefore = options.onBeforeLoad;
      return originalFn(url, {
        ...options,
        onBeforeLoad(win: Cypress.AUTWindow) {
          win.localStorage.setItem('auth_token', auth.token);
          win.localStorage.setItem('auth_user', JSON.stringify(auth.user));
          existingBefore?.(win);
        },
      });
    }
    return originalFn(url, options);
  }
);

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
