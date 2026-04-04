import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, switchMap, startWith, map, Observable, of } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-create-listing',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule
  ],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.scss',
})
export class CreateListing implements OnInit {
  private readonly listingService = inject(ListingService);
  private readonly brandService = inject(BrandService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly listingTypes = Object.values(ListingType);
  readonly listingType = ListingType;

  formData: Listing = {
    title: '',
    description: '',
    brand: '',
    composition: '',
    color: '',
    weight: '',
    length: '',
    type: ListingType.SALE,
    price: null,
    city: '',
    postalCode: '',
    imageUrls: [],
  };


  brands: { id: number; name: string }[] = [];
  selectedBrand: string = '';
  newBrand: string = '';
  brandCtrl = new FormControl('');
  filteredBrands$: Observable<{ id: number; name: string }[]> = of([]);
  showOtherOption = true;
  imageUrlsInput = '';
  loading = false;
  successMsg = '';
  errorMsg = '';


  ngOnInit(): void {
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands || [];
        this.selectedBrand = '';
        this.cdr.detectChanges();
      },
      error: () => {
        this.brands = [];
        this.cdr.detectChanges();
      },
    });

    this.filteredBrands$ = this.brandCtrl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => this.searchBrands(value || ''))
    );
  }

  searchBrands(query: string): Observable<{ id: number; name: string }[]> {
    if (!query || query === 'Autre') {
      return this.brandService.getBrands();
    }
    return this.brandService.getBrands().pipe(
      map(brands => brands.filter(b => b.name.toLowerCase().includes(query.toLowerCase())))
    );
  }

  onBrandSelected(event: MatAutocompleteSelectedEvent) {
    this.selectedBrand = event.option.value;
    this.showOtherOption = this.selectedBrand !== 'Autre';
  }

  onBrandBlur() {
    if (this.brandCtrl.value === 'Autre') {
      this.selectedBrand = 'Autre';
      this.showOtherOption = false;
    }
  }

  onTypeChange(): void {
    if (this.formData.type !== ListingType.SALE) {
      this.formData.price = null;
    }
  }

  onSubmit(form: NgForm): void {
    if (!form.valid || this.loading) {
      return;
    }
    // Préparer le payload selon le choix de la marque
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    let payload: any = {
      ...this.formData,
      imageUrls: this.imageUrlsInput
        .split(',')
        .map((url: string) => url.trim())
        .filter((url: string) => !!url),
    };

    if (this.selectedBrand === 'Autre') {
      delete payload.brand;
      payload.customBrand = this.newBrand;
    } else if (this.selectedBrand) {
      // Recherche l'id de la marque par le nom (car l'autocomplete renvoie le nom)
      const found = this.brands.find(b => b.name === this.selectedBrand || b.id === Number(this.selectedBrand));
      if (found) {
        payload.brandId = found.id;
        delete payload.brand;
      }
    }

    if (this.formData.type === ListingType.SALE && this.formData.price != null) {
      payload.price = this.formData.price;
    } else {
      delete payload.price;
    }

    this.listingService.createListing(payload).subscribe({
      next: () => {
        this.successMsg = 'Annonce creee avec succes.';
        this.loading = false;
        form.resetForm({
          type: ListingType.SALE,
        });
        this.formData = {
          title: '',
          description: '',
          brand: '',
          composition: '',
          color: '',
          weight: '',
          length: '',
          type: ListingType.SALE,
          price: null,
          city: '',
          postalCode: '',
          imageUrls: [],
        };
        this.imageUrlsInput = '';
      },
      error: (error: any) => {
        this.errorMsg = error?.error?.message || 'Erreur lors de la creation de l\'annonce.';
        this.loading = false;
      },
    });
  }
}
