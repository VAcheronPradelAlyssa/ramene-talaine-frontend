import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { ColorService, ColorOption } from '../../services/color.service';

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
  isEditMode = false;
  editListingId: string | null = null;
  loadingListing = false;
  private listingToEdit: Listing | null = null;
  debugMode = true;
  debugLoadedListing = '';
  debugFormColors = '';
  readonly otherColorOption = 'Autre';
  form: FormGroup;
  compositionAutre: string = '';
  compositionsList: { id: number; name: string }[] = [];
  compositionsError: any = null;
  colorsList: ColorOption[] = [];
  colorsError: any = null;
  private readonly compositionService = inject(CompositionService);
  private readonly colorService = inject(ColorService);
  private readonly listingService = inject(ListingService);
  private readonly route = inject(ActivatedRoute);
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
  filteredColors$: Observable<ColorOption[]>[] = [];
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
      colors: this.fb.array([], Validators.minLength(1)),
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
    this.initEditMode();

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

    this.colorService.getColors().subscribe({
      next: (data) => {
        this.colorsList = Array.isArray(data) ? data : [];
        this.colorsError = null;
        this.patchMissingColorLabels();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.colorsList = [];
        this.colorsError = err;
        this.cdr.detectChanges();
      }
    });

    // Récupération des marques (inchangé)
    this.brandService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands || [];
        if (!this.isEditMode) {
          this.selectedBrand = '';
        }
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

    // Ajoute une couleur par défaut
    if (this.colors.length === 0) {
      this.addColor();
    }
  }

  get compositions(): FormArray {
    return this.form.get('compositions') as FormArray;
  }

  get colors(): FormArray {
    return this.form.get('colors') as FormArray;
  }

  private createColorGroup(): FormGroup {
    return this.fb.group({
      colorQuery: ['', Validators.required],
      customColor: ['']
    });
  }

  addColor(): void {
    this.colors.push(this.createColorGroup());
    this.registerColorStream(this.colors.length - 1);
  }

  removeColor(index: number): void {
    this.colors.removeAt(index);
    this.filteredColors$.splice(index, 1);
    if (this.colors.length === 0) {
      this.addColor();
    }
  }

  private registerColorStream(index: number): void {
    const colorControl = (this.colors.at(index) as FormGroup).get('colorQuery');
    this.filteredColors$[index] = (colorControl?.valueChanges ?? of('')).pipe(
      startWith(colorControl?.value ?? ''),
      debounceTime(200),
      map((value) => this.filterColors(typeof value === 'string' ? value : ''))
    );
  }

  private filterColors(query: string): ColorOption[] {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = this.colorsList.filter((color) => color.name.toLowerCase().includes(normalizedQuery));

    if (this.otherColorOption.toLowerCase().includes(normalizedQuery) || normalizedQuery === '') {
      return [...matches, { id: this.otherColorOption, name: this.otherColorOption }];
    }

    return matches;
  }

  onColorSelectionChange(index: number): void {
    const colorGroup = this.colors.at(index) as FormGroup;
    const colorQuery = String(colorGroup.get('colorQuery')?.value ?? '').trim();
    const customColorControl = colorGroup.get('customColor');

    if (colorQuery === this.otherColorOption) {
      customColorControl?.setValidators([Validators.required]);
    } else {
      customColorControl?.clearValidators();
      customColorControl?.setValue('');
    }

    customColorControl?.updateValueAndValidity({ emitEvent: false });
  }

  onColorBlur(index: number): void {
    this.onColorSelectionChange(index);
  }

  private normalizeColorId(value: unknown): number | string {
    const normalized = String(value ?? '').trim();
    const asNumber = Number(normalized);
    return Number.isNaN(asNumber) ? normalized : asNumber;
  }

  private resolveColorLabelById(colorId: number | string | undefined): string | undefined {
    if (colorId == null) {
      return undefined;
    }

    const found = this.colorsList.find((c) => String(c.id) === String(colorId));
    return found?.name;
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

    const colorsPayload = (formValue.colors || [])
      .map((c: any) => {
        const colorQueryValue = String(c.colorQuery ?? '').trim();
        const customColorValue = String(c.customColor ?? '').trim();

        if (!colorQueryValue) {
          return null;
        }

        if (colorQueryValue === this.otherColorOption) {
          return customColorValue ? { customColor: customColorValue } : null;
        }

        const exactMatch = this.colorsList.find((color) => color.name.toLowerCase() === colorQueryValue.toLowerCase());
        return exactMatch ? { colorId: this.normalizeColorId(exactMatch.id) } : null;
      })
      .filter((c: any) => c !== null);

    const colorLabels = (formValue.colors || [])
      .map((c: any) => {
        const colorQueryValue = String(c.colorQuery ?? '').trim();
        const customColorValue = String(c.customColor ?? '').trim();

        if (!colorQueryValue) {
          return null;
        }

        if (colorQueryValue === this.otherColorOption) {
          return customColorValue || null;
        }

        const exactMatch = this.colorsList.find((color) => color.name.toLowerCase() === colorQueryValue.toLowerCase());
        return exactMatch?.name ?? colorQueryValue;
      })
      .filter((value: string | null) => value !== null);

    if (colorsPayload.length === 0) {
      this.loading = false;
      this.errorMsg = 'Veuillez ajouter au moins une couleur valide.';
      return;
    }

    // Construction stricte du payload selon le format attendu
    let payload: any = {
      title: formValue.title,
      description: formValue.description,
      brandId: null,
      color: colorLabels.join(', '),
      colors: colorsPayload,
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
    if (!payload.colors || !Array.isArray(payload.colors) || payload.colors.length === 0) {
      delete payload.colors;
    }
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

    const request$ = this.isEditMode && this.editListingId
      ? this.listingService.updateListing(this.editListingId, payload)
      : this.listingService.createListing(payload);

    request$.subscribe({
      next: () => {
        this.successMsg = this.isEditMode
          ? 'Annonce modifiee avec succes.'
          : 'Annonce creee avec succes.';
        this.loading = false;
        if (!this.isEditMode) {
          this.form.reset({ type: ListingType.SALE });
          this.submitted = false;
          while (this.compositions.length > 0) {
            this.compositions.removeAt(0);
          }
          while (this.colors.length > 0) {
            this.colors.removeAt(0);
          }
          this.addComposition();
          this.addColor();
          this.selectedBrand = '';
          this.newBrand = '';
        }
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        this.errorMsg = error?.error?.message || 'Erreur lors de l\'enregistrement de l\'annonce.';
        this.loading = false;
        // Ne pas reset submitted ici pour garder l'affichage des erreurs
        this.cdr.detectChanges();
      },
    });
  }

  private initEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.isEditMode = true;
    this.editListingId = id;
    this.loadingListing = true;

    this.listingService.getListingById(id).subscribe({
      next: (listing) => {
        this.listingToEdit = listing;
        this.debugLoadedListing = JSON.stringify(listing, null, 2);
        this.populateFormForEdit(listing);

        if (!this.hasColorData(listing)) {
          this.hydrateMissingColorsFromLists(id);
        }

        this.loadingListing = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.loadingListing = false;
        this.errorMsg = error?.error?.message || 'Impossible de charger l\'annonce a modifier.';
        this.cdr.detectChanges();
      },
    });
  }

  private populateFormForEdit(listing: Listing): void {
    const brandName = typeof listing.brand === 'string'
      ? listing.brand
      : String(listing.brand?.name ?? '').trim();
    const hasCustomBrand = !!String(listing.customBrand ?? '').trim();

    this.form.patchValue({
      title: listing.title ?? '',
      description: listing.description ?? '',
      brand: hasCustomBrand ? 'Autre' : brandName,
      newBrand: listing.customBrand ?? '',
      weightValue: listing.weight ? Number(listing.weight) : null,
      length: listing.length ? Number(listing.length) : null,
      type: listing.type ?? ListingType.SALE,
      price: listing.price ?? null,
      city: listing.city ?? '',
      postalCode: listing.postalCode ?? '',
      imageUrls: Array.isArray(listing.imageUrls) ? listing.imageUrls.join(', ') : '',
    });

    this.selectedBrand = hasCustomBrand ? 'Autre' : '';
    this.showOtherOption = this.selectedBrand !== 'Autre';

    while (this.compositions.length > 0) {
      this.compositions.removeAt(0);
    }

    const listingCompositions = Array.isArray(listing.compositions) ? listing.compositions : [];
    if (listingCompositions.length === 0) {
      this.addComposition();
    } else {
      for (const composition of listingCompositions) {
        const compositionId = (composition as any)?.compositionId
          ?? (composition as any)?.id
          ?? (composition as any)?.composition?.id
          ?? '';
        const percentage = (composition as any)?.percentage ?? '';
        this.compositions.push(
          this.fb.group({
            compositionId: [String(compositionId)],
            customComposition: [''],
            percentage: [percentage],
          })
        );
      }
    }

    while (this.colors.length > 0) {
      this.colors.removeAt(0);
    }
    this.filteredColors$ = [];

    const listingColors = Array.isArray(listing.colors) ? listing.colors : [];
    const fallbackColorLabels = this.extractFallbackColorLabels(listing);

    if (listingColors.length > 0) {
      listingColors.forEach((color, index) => {
        this.addColor();
        const colorData = color as any;
        const primitiveColorValue =
          typeof colorData === 'string' || typeof colorData === 'number'
            ? String(colorData).trim()
            : '';
        const colorId = colorData?.colorId ?? colorData?.id ?? colorData?.color?.id;
        const explicitColorName = String(
          colorData?.colorName ?? colorData?.name ?? colorData?.label ?? colorData?.color?.name ?? colorData?.color?.label ?? ''
        ).trim();
        const customColor = String(colorData?.customColor ?? colorData?.color?.customColor ?? '').trim();
        const fallbackLabel = fallbackColorLabels[index] ?? '';

        const primitiveAsId = /^\d+$/.test(primitiveColorValue) ? Number(primitiveColorValue) : primitiveColorValue;

        const colorLabel = customColor
          ? this.otherColorOption
          : explicitColorName
            || this.resolveColorLabelById(colorId)
            || this.resolveColorLabelById(primitiveAsId as number | string)
            || (primitiveColorValue && !/^\d+$/.test(primitiveColorValue) ? primitiveColorValue : '')
            || fallbackLabel
            || String(colorId ?? '').trim();
        const colorGroup = this.colors.at(index) as FormGroup;
        colorGroup.patchValue({
          colorQuery: colorLabel,
          customColor,
        });
        this.onColorSelectionChange(index);
      });
    } else {
      if (fallbackColorLabels.length > 0) {
        fallbackColorLabels.forEach((fallbackColor) => {
          this.addColor();
          const index = this.colors.length - 1;
          const colorGroup = this.colors.at(index) as FormGroup;
          colorGroup.patchValue({ colorQuery: fallbackColor, customColor: '' });
        });
      } else {
        this.addColor();
      }
    }

    this.onTypeChange();
    this.refreshDebugFormColors();
  }

  private patchMissingColorLabels(): void {
    if (!this.isEditMode || !this.listingToEdit || this.colors.length === 0 || this.colorsList.length === 0) {
      return;
    }

    const listingColors = Array.isArray(this.listingToEdit.colors) ? this.listingToEdit.colors : [];
    for (let index = 0; index < this.colors.length; index += 1) {
      const colorGroup = this.colors.at(index) as FormGroup;
      const currentValue = String(colorGroup.get('colorQuery')?.value ?? '').trim();
      if (currentValue !== '') {
        continue;
      }

      const colorData = listingColors[index] as any;
      const primitiveColorValue =
        typeof colorData === 'string' || typeof colorData === 'number'
          ? String(colorData).trim()
          : '';
      const colorId = colorData?.colorId ?? colorData?.id ?? colorData?.color?.id;
      const primitiveAsId = /^\d+$/.test(primitiveColorValue) ? Number(primitiveColorValue) : primitiveColorValue;
      const resolved = this.resolveColorLabelById(colorId)
        || this.resolveColorLabelById(primitiveAsId as number | string)
        || (primitiveColorValue && !/^\d+$/.test(primitiveColorValue) ? primitiveColorValue : '');
      if (resolved) {
        colorGroup.patchValue({ colorQuery: resolved });
      }
    }

    this.refreshDebugFormColors();
  }

  private extractFallbackColorLabels(listing: Listing): string[] {
    const raw = (listing as any)?.color;

    if (Array.isArray(raw)) {
      return raw
        .map((item) => String((item as any)?.name ?? (item as any)?.label ?? item ?? '').trim())
        .filter((value) => value !== '');
    }

    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((value) => value.trim())
        .filter((value) => value !== '');
    }

    if (raw && typeof raw === 'object') {
      const single = String((raw as any)?.name ?? (raw as any)?.label ?? '').trim();
      return single ? [single] : [];
    }

    return [];
  }

  private hasColorData(listing: Listing): boolean {
    if (Array.isArray(listing.colors) && listing.colors.length > 0) {
      return true;
    }

    const rawColor = (listing as any)?.color;

    if (typeof rawColor === 'string') {
      return rawColor.trim() !== '';
    }

    if (Array.isArray(rawColor)) {
      return rawColor.length > 0;
    }

    if (rawColor && typeof rawColor === 'object') {
      const label = String((rawColor as any)?.name ?? (rawColor as any)?.label ?? '').trim();
      return label !== '';
    }

    return false;
  }

  private hydrateMissingColorsFromLists(id: string): void {
    this.listingService.getMyListings().subscribe({
      next: (myListings) => {
        const fromMine = myListings.find((item) => String(item.id) === String(id));

        if (fromMine && this.hasColorData(fromMine)) {
          this.applyFallbackColors(fromMine);
          return;
        }

        this.listingService.getAllListings().subscribe({
          next: (allListings) => {
            const fromAll = allListings.find((item) => String(item.id) === String(id));
            if (fromAll && this.hasColorData(fromAll)) {
              this.applyFallbackColors(fromAll);
            }
          },
          error: () => {
            // Non bloquant
          },
        });
      },
      error: () => {
        this.listingService.getAllListings().subscribe({
          next: (allListings) => {
            const fromAll = allListings.find((item) => String(item.id) === String(id));
            if (fromAll && this.hasColorData(fromAll)) {
              this.applyFallbackColors(fromAll);
            }
          },
          error: () => {
            // Non bloquant
          },
        });
      },
    });
  }

  private applyFallbackColors(source: Listing): void {
    if (!this.listingToEdit) {
      return;
    }

    this.listingToEdit = {
      ...this.listingToEdit,
      colors: source.colors ?? this.listingToEdit.colors,
      color: ((source as any).color ?? (this.listingToEdit as any).color) as any,
    };

    this.debugLoadedListing = JSON.stringify(this.listingToEdit, null, 2);
    this.populateFormForEdit(this.listingToEdit);
    this.cdr.detectChanges();
  }

  private refreshDebugFormColors(): void {
    const value = this.colors.controls.map((control, index) => ({
      index,
      colorQuery: String(control.get('colorQuery')?.value ?? ''),
      customColor: String(control.get('customColor')?.value ?? ''),
    }));
    this.debugFormColors = JSON.stringify(value, null, 2);
  }
}