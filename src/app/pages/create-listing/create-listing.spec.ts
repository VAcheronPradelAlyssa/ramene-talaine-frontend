import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateListing } from './create-listing';

describe('CreateListing', () => {
  let component: CreateListing;
  let fixture: ComponentFixture<CreateListing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateListing],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateListing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
