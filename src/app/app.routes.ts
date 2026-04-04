
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Inscription } from './components/inscription/inscription';
import { Connexion } from './components/connexion/connexion';
import { Profile } from './pages/profile/profile';
import { CreateListing } from './pages/create-listing/create-listing';
import { Listings } from './pages/listings/listings';
import { authGuard } from './guards/auth.guard';
import { ListingDetailComponent } from './pages/listing-detail/listing-detail.component';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'inscription', component: Inscription },
  { path: 'connexion', component: Connexion },
  { path: 'listings', component: Listings, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'create-listing', component: CreateListing, canActivate: [authGuard] },
  { path: 'annonces/:id', component: ListingDetailComponent },
];
