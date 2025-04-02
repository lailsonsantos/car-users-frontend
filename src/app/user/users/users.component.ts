import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  userForm: FormGroup;
  users: any[] = [];
  editingUserId: number | null = null;

  constructor(private fb: FormBuilder,
              private userService: UserService) {
    this.userForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['']
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(data => {
      this.users = data;
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.userService.createUser(this.userForm.value).subscribe(response => {
        this.loadUsers();
        this.userForm.reset();
      });
    }
  }

  enableEditing(user: any) {
    this.editingUserId = user.id;
    this.userForm.patchValue(user);
  }

  saveUser(userId: number) {
    if (this.userForm.valid) {
      this.userService.updateUser(userId, this.userForm.value).subscribe(response => {
        this.editingUserId = null;
        this.loadUsers();
      });
    }
  }

  deleteUser(userId: number) {
    this.userService.deleteUser(userId).subscribe(() => {
      this.loadUsers();
    });
  }

  onUserPhotoSelected(event: any, userId: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.userService.uploadUserPhoto(userId, file).subscribe(response => {
        this.loadUsers();
      }, error => {
        console.error('Erro ao enviar foto do usuário:', error);
      });
    }
  }
}
