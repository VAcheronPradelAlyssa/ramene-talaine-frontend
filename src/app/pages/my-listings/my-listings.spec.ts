import { render } from '@testing-library/angular';
import { MyListings } from './my-listings';
import { ListingService } from '../../services/listing.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('MyListings', () => {
  it('affiche les annonces de l\'utilisateur', async () => {
    const fakeListings = [
      { title: 'Annonce 1', description: 'Desc 1', price: 10 },
      { title: 'Annonce 2', description: 'Desc 2', price: 20 },
    ];
    await render(MyListings, {
      imports: [CommonModule],
      providers: [
        {
          provide: ListingService,
          useValue: { getMyListings: () => of(fakeListings) },
        },
      ],
    });
    expect(document.body.textContent).toContain('Annonce 1');
    expect(document.body.textContent).toContain('Annonce 2');
  });
});
