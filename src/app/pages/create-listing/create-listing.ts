import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm, FormControl, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CompositionService } from '../../services/composition.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, switchMap, startWith, map, Observable, of } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { BrandService } from '../../services/brand.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-create-listing',
  standalone: true,
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
  form: FormGroup;
  compositionAutre: string = '';
  compositionsList: { id: number; name: string }[] = [];
  compositionsError: any = null;
  private readonly compositionService = inject(CompositionService);
  private readonly listingService = inject(ListingService);
  private readonly brandService = inject(BrandService);
  private readonly authService = inject(AuthService);
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

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      brand: ['', Validators.required],
      newBrand: [''],
      color: ['', Validators.required],
      weight: ['', Validators.required],
      length: ['', Validators.required],
      type: [ListingType.SALE, Validators.required],
      price: [null],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      imageUrls: [''],
      compositions: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Récupération dynamique des compositions
    this.compositionService.getCompositions().subscribe({
      next: (data) => {
        this.compositionsList = Array.isArray(data) ? data : [];
        this.compositionsError = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.compositionsList = [];
        this.compositionsError = err;
        this.cdr.detectChanges();
      }
    });

    // Récupération des marques (inchangé)
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

    // Ajoute une composition par défaut
    if (this.compositions.length === 0) {
      this.addComposition();
    }
  }

  get compositions(): FormArray {
    return this.form.get('compositions') as FormArray;
  }

  addComposition(): void {
    this.compositions.push(this.fb.group({
      compositionId: [''],
      customComposition: [''],
      percentage: ['']
    }));
  }

  removeComposition(index: number): void {
    this.compositions.removeAt(index);
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
    // Synchronise la valeur avec le champ du formulaire réactif
    this.form.get('brand')?.setValue(this.selectedBrand !== 'Autre' ? this.selectedBrand : '');
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

  onSubmit(): void {
    if (this.form.invalid || this.loading) {
      return;
    }
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    // Préparer le payload
    const formValue = this.form.value;
    const compositionsPayload = formValue.compositions.map((c: any) => {
      if (c.compositionId === 'Autre' || !c.compositionId) {
        return {
          customComposition: c.customComposition,
          percentage: c.percentage || null
        };
      } else {
        return {
          compositionId: Number(c.compositionId),
          percentage: c.percentage || null
        };
      }
    });

    let payload: any = {
      ...formValue,
      compositions: compositionsPayload,
      imageUrls: (formValue.imageUrls || '').split(',').map((url: string) => url.trim()).filter((url: string) => !!url),
    };
    console.log('Payload envoyé à l\'API:', payload);

    // Gestion de la marque
    if (this.selectedBrand === 'Autre') {
      delete payload.brand;
      payload.customBrand = this.newBrand;
    } else if (this.selectedBrand) {
      const found = this.brands.find(b => b.name === this.selectedBrand || b.id === Number(this.selectedBrand));
      if (found) {
        payload.brandId = found.id;
        delete payload.brand;
      }
    }

    if (formValue.type === ListingType.SALE && formValue.price != null) {
      payload.price = formValue.price;
    } else {
      delete payload.price;
    }

    // Ajout du sellerId si utilisateur connecté
    const user = (this.authService as any)._currentUser?.value;
    if (user && user.id) {
      payload.sellerId = user.id;
    }

    this.listingService.createListing(payload).subscribe({
      next: () => {
        this.successMsg = 'Annonce creee avec succes.';
        this.loading = false;
        this.form.reset({ type: ListingType.SALE });
        // Réinitialise le FormArray
        while (this.compositions.length > 0) {
          this.compositions.removeAt(0);
        }
        this.addComposition();
        this.selectedBrand = '';
        this.newBrand = '';
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMsg = error?.error?.message || 'Erreur lors de la creation de l\'annonce.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}