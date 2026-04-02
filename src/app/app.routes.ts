
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Inscription } from './components/inscription/inscription';
import { Connexion } from './components/connexion/connexion';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [authGuard] },
  { path: 'inscription', component: Inscription },
  { path: 'connexion', component: Connexion },
];
