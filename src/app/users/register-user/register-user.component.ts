
import { Component } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-register-user',
  template: \`
    <h2>Register User</h2>
    <form (ngSubmit)="save()">
      <input [(ngModel)]="user.firstName" name="firstName" placeholder="First Name" required>
      <input [(ngModel)]="user.lastName" name="lastName" placeholder="Last Name" required>
      <input [(ngModel)]="user.login" name="login" placeholder="Login" required>
      <button type="submit">Save</button>
    </form>
  \`
})
export class RegisterUserComponent {
  user: User = { firstName: '', lastName: '', email: '', login: '', phone: '', birthday: '' };

  constructor(private service: UserService, private router: Router) {}

  save() {
    this.service.create(this.user).subscribe(() => this.router.navigate(['/users']));
  }
}
