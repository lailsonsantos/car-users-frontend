
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-list-users',
  template: \`
    <h2>Users</h2>
    <ul>
      <li *ngFor="let u of users">{{ u.firstName }} {{ u.lastName }}</li>
    </ul>
  \`
})
export class ListUsersComponent implements OnInit {
  users: User[] = [];

  constructor(private service: UserService) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => this.users = data);
  }
}
