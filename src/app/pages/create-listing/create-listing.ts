import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
    submitted = false;
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
      brand: ['', this.brandValidator.bind(this)],
      newBrand: [''],
      color: ['', Validators.required],
      weightValue: [null, [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(1)]],
      length: [null, [Validators.required, Validators.pattern('^[0-9]+([.][0-9]+)?$'), Validators.min(0)]],
      type: [ListingType.SALE, Validators.required],
      price: [null, [Validators.required, Validators.min(0)]],
      city: ['', Validators.required],
      postalCode: ['', Validators.required],
      imageUrls: [''],
      compositions: this.fb.array([])
    });

  }

  brandValidator(control: AbstractControl): ValidationErrors | null {
    if (control.value === 'Autre') {
      const newBrandValue = this.form?.get('newBrand')?.value;
      if (!newBrandValue || newBrandValue.trim() === '') {
        return { required: true };
      }
    }
    if (!control.value || control.value.trim() === '') {
      return { required: true };
    }
    return null;
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

    const brandControl = this.form.get('brand');
    const newBrandControl = this.form.get('newBrand');

    this.filteredBrands$ = (brandControl?.valueChanges ?? of('')).pipe(
      startWith(brandControl?.value ?? ''),
      debounceTime(300),
      switchMap(value => this.searchBrands(typeof value === 'string' ? value : ''))
    );

    brandControl?.valueChanges.subscribe((value) => {
      const isOther = value === 'Autre';
      this.selectedBrand = isOther ? 'Autre' : '';
      this.showOtherOption = !isOther;

      if (isOther) {
        newBrandControl?.setValidators([Validators.required]);
      } else {
        newBrandControl?.clearValidators();
        newBrandControl?.setValue('');
      }
      newBrandControl?.updateValueAndValidity({ emitEvent: false });
      brandControl.updateValueAndValidity({ emitEvent: false });
    });

    // Le validateur de brand dépend de newBrand dans le cas "Autre".
    // Il faut donc revalider brand à chaque saisie de newBrand.
    newBrandControl?.valueChanges.subscribe(() => {
      if (brandControl?.value === 'Autre') {
        brandControl.updateValueAndValidity({ emitEvent: false });
      }
    });

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
    this.form.get('brand')?.setValue(this.selectedBrand);
  }

  onBrandBlur() {
    if (this.form.get('brand')?.value === 'Autre') {
      this.selectedBrand = 'Autre';
      this.showOtherOption = false;
    }
  }

  onTypeChange(): void {
    const type = this.form.get('type')?.value;
    const priceCtrl = this.form.get('price');
    if (type === ListingType.SALE) {
      priceCtrl?.setValidators([Validators.required, Validators.min(0)]);
    } else {
      priceCtrl?.clearValidators();
      priceCtrl?.setValue(null);
    }
    priceCtrl?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.form.invalid || this.loading) {
      this.errorMsg = 'Merci de remplir tous les champs obligatoires.';
      return;
    }
    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    const formValue = this.form.value;
    const brandValue = String(formValue.brand ?? '').trim();
    const newBrandValue = String(formValue.newBrand ?? '').trim();
    const isOtherBrand = brandValue === 'Autre';

    if (isOtherBrand && !newBrandValue) {
      this.loading = false;
      this.errorMsg = 'Veuillez saisir la nouvelle marque.';
      return;
    }

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

    // Construction stricte du payload selon le format attendu
    let payload: any = {
      title: formValue.title,
      description: formValue.description,
      brandId: null,
      color: formValue.color,
      weight: Number(formValue.weightValue),
      weightUnit: 'g',
      length: formValue.length ? Number(formValue.length) : undefined,
      type: formValue.type, // à adapter si besoin (ex: 'VETEMENT')
      price: formValue.price,
      city: formValue.city,
      postalCode: formValue.postalCode,
      imageUrls: (formValue.imageUrls || '').split(',').map((url: string) => url.trim()).filter((url: string) => !!url),
      compositions: compositionsPayload
    };
    // Ajout du champ composition si présent dans le formulaire (texte libre)
    if (formValue.composition && formValue.composition.trim() !== '') {
      payload.composition = formValue.composition;
    }

      // (Bloc supprimé : gestion de la marque déjà faite plus haut)

    // Mapping strict de la marque pour le backend.
    if (isOtherBrand) {
      payload.brandId = null;
      payload.customBrand = newBrandValue;
    } else {
      const found = this.brands.find(b => b.name === brandValue || b.id === Number(brandValue));
      if (found) {
        payload.brandId = found.id;
      }
      delete payload.customBrand;
    }

    // Ne jamais envoyer les champs de formulaire bruts.
    delete payload.brand;
    delete payload.newBrand;

    // Ne pas envoyer length si vide
    if (payload.length === undefined || payload.length === null || payload.length === '') {
      delete payload.length;
    }
    // Ne pas envoyer composition si vide
    if (!payload.composition || payload.composition.trim() === '') {
      delete payload.composition;
    }
    // Ne pas envoyer price si null
    if (payload.price === null || payload.price === undefined || payload.price === '') {
      delete payload.price;
    }
    // Ne pas envoyer compositions si vide
    if (!payload.compositions || !Array.isArray(payload.compositions) || payload.compositions.length === 0) {
      delete payload.compositions;
    }
    // Affichage debug détaillé
    console.log('Payload envoyé à l\'API:', payload);
    console.log('[DEBUG] Champs marque envoyés:', {
      brandId: payload.brandId,
      customBrand: payload.customBrand,
      formBrand: brandValue,
      formNewBrand: newBrandValue,
      isOtherBrand
    });

    // Nettoyage des champs optionnels pour éviter d'envoyer null
    if (payload.customBrand == null || payload.customBrand === '') {
      delete payload.customBrand;
    }
    if (payload.composition == null || payload.composition === '') {
      delete payload.composition;
    }

    if (formValue.type === ListingType.SALE && formValue.price != null) {
      payload.price = formValue.price;
    } else {
      payload.price = null; // Set price to null for non-SALE types
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
        this.submitted = false;
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
        // Ne pas reset submitted ici pour garder l'affichage des erreurs
        this.cdr.detectChanges();
      },
    });
  }
}