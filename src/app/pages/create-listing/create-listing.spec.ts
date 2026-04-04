import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { CreateListing } from './create-listing';
import { ListingService } from '../../services/listing.service';
import { BrandService } from '../../services/brand.service';
import { CompositionService } from '../../services/composition.service';
import { AuthService } from '../../services/auth.service';
import { ColorService } from '../../services/color.service';
import { ListingType } from '../../models/listing.model';

describe('CreateListing', () => {
  let component: CreateListing;
  let fixture: ComponentFixture<CreateListing>;
  let listingServiceSpy: { createListing: ReturnType<typeof vi.fn> };

  const brandServiceMock = {
    getBrands: () => of([{ id: 1, name: 'Nike' }]),
  };

  const compositionServiceMock = {
    getCompositions: () => of([{ id: 42, name: 'Coton' }]),
  };

  const colorServiceMock = {
    getColors: () => of([{ id: 1, name: 'Turquoise' }]),
  };

  const authServiceMock = {
    _currentUser: { value: null },
  };

  beforeEach(async () => {
    listingServiceSpy = {
      createListing: vi.fn().mockReturnValue(of({} as any)),
    };

    await TestBed.configureTestingModule({
      imports: [CreateListing],
      providers: [
        { provide: ListingService, useValue: listingServiceSpy },
        { provide: BrandService, useValue: brandServiceMock },
        { provide: CompositionService, useValue: compositionServiceMock },
        { provide: ColorService, useValue: colorServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateListing);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send brandId null and customBrand when brand is Autre', () => {
    component.colors.clear();
    component.addColor();
    component.compositions.clear();
    component.addComposition();

    component.form.patchValue({
      title: 'Titre',
      description: 'Description',
      brand: 'Autre',
      newBrand: 'Marque Perso',
      weightValue: 500,
      length: '120',
      type: ListingType.SALE,
      price: 19.99,
      city: 'Paris',
      postalCode: '75000',
      imageUrls: 'https://exemple.com/1.jpg, https://exemple.com/2.jpg',
    });

    const firstComposition = component.compositions.at(0);
    const firstColor = component.colors.at(0);

    firstColor.patchValue({
      colorQuery: 'Turquoise',
      customColor: '',
    });

    firstComposition.patchValue({
      compositionId: 42,
      percentage: 80,
    });

    component.onSubmit();

    expect(listingServiceSpy.createListing).toHaveBeenCalled();
    const payload = listingServiceSpy.createListing.mock.calls[0][0] as any;
    expect(payload.brandId).toBeNull();
    expect(payload.customBrand).toBe('Marque Perso');
    expect(payload.brand).toBeUndefined();
    expect(payload.newBrand).toBeUndefined();
    expect(payload.color).toBe('Turquoise');
    expect(payload.colors).toEqual([{ colorId: 1 }]);
  });
});
