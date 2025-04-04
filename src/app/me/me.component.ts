import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-me',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './me.component.html'
})
export class MeComponent implements OnInit {
  user?: User;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Erro ao buscar /api/me:', err);
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/api/signin']);
  }
}
