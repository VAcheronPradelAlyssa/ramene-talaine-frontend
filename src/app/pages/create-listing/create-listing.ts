import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Listing, ListingType } from '../../models/listing.model';
import { ListingService } from '../../services/listing.service';

@Component({
  selector: 'app-create-listing',
  imports: [CommonModule, FormsModule],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.scss',
})
export class CreateListing {
  private readonly listingService = inject(ListingService);

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

  imageUrlsInput = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  onTypeChange(): void {
    if (this.formData.type !== ListingType.SALE) {
      this.formData.price = null;
    }
  }

  onSubmit(form: NgForm): void {
    if (!form.valid || this.loading) {
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    const payload: Listing = {
      ...this.formData,
      imageUrls: this.imageUrlsInput
        .split(',')
        .map((url) => url.trim())
        .filter((url) => !!url),
      price: this.formData.type === ListingType.SALE ? this.formData.price : null,
    };

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
      error: (error) => {
        this.errorMsg = error?.error?.message || 'Erreur lors de la creation de l\'annonce.';
        this.loading = false;
      },
    });
  }
}
