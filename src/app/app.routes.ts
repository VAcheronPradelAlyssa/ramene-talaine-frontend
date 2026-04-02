
import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Inscription } from './components/inscription/inscription';
import { Connexion } from './components/connexion/connexion';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'inscription', component: Inscription },
  { path: 'connexion', component: Connexion },
];
