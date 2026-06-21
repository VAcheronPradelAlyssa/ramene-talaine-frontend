describe('Page création d\'annonce (/create-listing)', () => {
  beforeEach(() => {
    cy.login();
    cy.interceptRefData();
    cy.visit('/#/create-listing');
    cy.wait(['@getBrands', '@getColors', '@getCompositions']);
  });

  it('affiche le titre "Creer une annonce"', () => {
    cy.contains('Creer une annonce').should('be.visible');
  });

  it('affiche le formulaire de création', () => {
    cy.get('input[formControlName="title"]').should('be.visible');
    cy.get('textarea[formControlName="description"]').should('be.visible');
    cy.get('select[formControlName="type"]').should('be.visible');
  });

  it('affiche une erreur si le titre est vide et soumis', () => {
    cy.get('textarea[formControlName="description"]').type('Une belle pelote.');
    cy.get('button[type="submit"]').click();
    cy.get('input[formControlName="title"]').parents('label').find('.error').should('be.visible');
  });

  it('affiche le champ Prix uniquement pour le type SALE', () => {
    cy.get('input[formControlName="price"]').should('not.exist');
    cy.get('select[formControlName="type"]').select('SALE');
    cy.get('input[formControlName="price"]').should('be.visible');
  });

  it('affiche "Modification..." lors de la soumission en mode édition', () => {
    cy.login();
    cy.interceptRefData();

    cy.fixture('listings/detail').then((listing) => {
      cy.intercept('GET', '**/api/listings/10', { statusCode: 200, body: listing }).as('getListing');
    });

    cy.visit('/#/edit-listing/10');
    cy.wait(['@getBrands', '@getColors', '@getCompositions', '@getListing']);

    cy.contains('Modifier une annonce').should('be.visible');
  });

  it('affiche un message de succès après création réussie', () => {
    cy.fixture('listings/detail').then((listing) => {
      cy.intercept('POST', '**/api/listings', {
        statusCode: 201,
        body: listing,
      }).as('createListing');
    });

    cy.get('input[formControlName="title"]').type('Nouvelle pelote');
    cy.get('textarea[formControlName="description"]').type('Belle pelote rose.');
    cy.get('input[formControlName="weightValue"]').type('50');
    cy.get('input[formControlName="length"]').type('100');
    cy.get('input[formControlName="city"]').type('Lyon');
    cy.get('input[formControlName="postalCode"]').type('69001');

    cy.get('button[type="submit"]').click();
    cy.wait('@createListing');
    cy.contains('succès').should('be.visible');
  });
});
