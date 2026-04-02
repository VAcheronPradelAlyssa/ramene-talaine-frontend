import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/shared/navbar/navbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private http = inject(HttpClient);

  status = signal('chargement');
  response = signal<unknown>(null);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get('http://localhost:8080/api/health').subscribe({
      next: (data) => {
        this.status.set('connecte');
        this.response.set(data);
      },
      error: (err) => {
        this.status.set('erreur');
        this.error.set(err?.message ?? 'Erreur inconnue');
      }
    });
  }
}
