import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html'
})
export class UserRegistrationComponent {
  registerForm: FormGroup;
  errorMessage: string = '';

  constructor(private fb: FormBuilder,
              private userService: UserService,
              private router: Router) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      birthday: ['', Validators.required],
      login: ['', Validators.required],
      password: ['', Validators.required],
      phone: ['']
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.userService.createUser(this.registerForm.value).subscribe(response => {
        // Após cadastro, redirecione para a tela de login.
        this.router.navigate(['/login']);
      }, error => {
        this.errorMessage = 'Erro ao cadastrar usuário.';
      });
    }
  }
}
