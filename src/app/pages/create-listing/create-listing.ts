import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-create-listing',
  imports: [CommonModule, FormsModule],
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
      payload.brandId = Number(this.selectedBrand);
      delete payload.brand;
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
