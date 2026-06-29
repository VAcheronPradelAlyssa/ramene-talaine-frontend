import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { Listing, ListingType } from '../../models/listing.model';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss',
})
export class UserProfile implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  user?: User;
  listings: Listing[] = [];
  loadingUser = true;
  loadingListings = true;
  errorMsg = '';
  listingType = ListingType;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    if (!id) {
      void this.router.navigate(['/']);
      return;
    }

    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
        this.loadingUser = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Utilisateur introuvable.';
        this.loadingUser = false;
        this.cdr.detectChanges();
      },
    });

    this.userService.getUserListings(id).subscribe({
      next: (listings) => {
        this.listings = listings;
        this.loadingListings = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingListings = false;
        this.cdr.detectChanges();
      },
    });
  }

  getInitials(user: User): string {
    return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
  }

  getTypeLabel(listing: Listing): string {
    if (listing.type === ListingType.FREE) return 'Don';
    if (listing.type === ListingType.EXCHANGE) return 'Échange';
    return `${listing.price ?? 0} €`;
  }

  getImageUrl(listing: Listing): string {
    return listing.imageUrls?.[0] || 'assets/logo/Ramene-ta-laine.png';
  }
}
