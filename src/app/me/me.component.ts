
import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-me',
  template: `
    <h2>Welcome, {{ user?.firstName }}</h2>
    <p>Email: {{ user?.email }}</p>
    <p>Login: {{ user?.login }}</p>
  `
})
export class MeComponent implements OnInit {
  user?: User;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.userService.getMe().subscribe(user => this.user = user);
  }
}
