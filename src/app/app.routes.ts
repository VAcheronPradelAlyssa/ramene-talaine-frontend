import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Inscription } from './components/inscription/inscription';
import { Connexion } from './components/connexion/connexion';
import { Profile } from './pages/profile/profile';
import { CreateListing } from './pages/create-listing/create-listing';
import { Listings } from './pages/listings/listings';
import { authGuard } from './guards/auth.guard';
import { ListingDetail } from './pages/listing-detail/listing-detail';
import { MyListings } from './pages/my-listings/my-listings';
import { EditProfile } from './pages/edit-profile/edit-profile';
import { ChangePassword } from './pages/change-password/change-password';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { EmailVerification } from './pages/email-verification/email-verification';
import { AccountSettings } from './pages/account-settings/account-settings';
import { UserProfile } from './pages/user-profile/user-profile';

export const routes: Routes = [
  { path: '', component: Home },

  // Auth
  { path: 'inscription', component: Inscription },
  { path: 'connexion', component: Connexion },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  { path: 'verify-email', component: EmailVerification },

  // Compte (protégé)
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'edit-profile', component: EditProfile, canActivate: [authGuard] },
  { path: 'change-password', component: ChangePassword, canActivate: [authGuard] },
  { path: 'account-settings', component: AccountSettings, canActivate: [authGuard] },

  // Profil public
  { path: 'utilisateur/:id', component: UserProfile },

  // Annonces
  { path: 'listings', component: Listings, canActivate: [authGuard] },
  { path: 'annonces/:id', component: ListingDetail },
  { path: 'mes-annonces', component: MyListings, canActivate: [authGuard] },
  { path: 'create-listing', component: CreateListing, canActivate: [authGuard] },
  { path: 'edit-listing/:id', component: CreateListing, canActivate: [authGuard] },
];
