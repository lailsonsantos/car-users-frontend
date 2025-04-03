import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  FormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { Router } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { Car } from '../../core/models/car.model';
import { User } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';

interface CarForm {
  year: FormControl<number | null>;
  licensePlate: FormControl<string | null>;
  model: FormControl<string | null>;
  color: FormControl<string | null>;
}

interface UserForm {
  firstName: FormControl<string | null>;
  lastName: FormControl<string | null>;
  email: FormControl<string | null>;
  birthday: FormControl<string | null>;
  login: FormControl<string | null>;
  password: FormControl<string | null>;
  phone: FormControl<string | null>;
  cars: FormArray<FormGroup<CarForm>>;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userForm: FormGroup<UserForm>;
  users: User[] = [];
  editingUserId: number | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.fb.group<UserForm>({
      firstName: this.fb.control('', Validators.required),
      lastName: this.fb.control('', Validators.required),
      email: this.fb.control('', [Validators.required, Validators.email]),
      birthday: this.fb.control('', Validators.required),
      login: this.fb.control('', Validators.required),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      phone: this.fb.control(''),
      cars: this.fb.array<FormGroup<CarForm>>([])
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  get carsFormArray(): FormArray<FormGroup<CarForm>> {
    return this.userForm.get('cars') as FormArray<FormGroup<CarForm>>;
  }

  get isEditing(): boolean {
    return this.editingUserId !== null;
  }

  createCarFormGroup(carData?: Partial<Car>): FormGroup<CarForm> {
    return this.fb.group<CarForm>({
      year: this.fb.control(
        carData?.year ?? null,
        [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]
      ),
      licensePlate: this.fb.control(
        carData?.licensePlate ?? '',
        [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/)]
      ),
      model: this.fb.control(carData?.model ?? '', Validators.required),
      color: this.fb.control(carData?.color ?? '', Validators.required)
    });
  }

  addCar(carData?: Partial<Car>): void {
    this.carsFormArray.push(this.createCarFormGroup(carData));
  }

  removeCar(index: number): void {
    this.carsFormArray.removeAt(index);
  }

  loadUsers(): void {
    this.userService.getAll().subscribe(data => {
      this.users = data;
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
  
      const rawCars = formValue.cars!.map(carGroup => {
        const carValue = carGroup;
  
        const isEmpty =
          (carValue.year == null || carValue.year === 0) &&
          (!carValue.licensePlate || carValue.licensePlate.trim() === '') &&
          (!carValue.model || carValue.model.trim() === '') &&
          (!carValue.color || carValue.color.trim() === '');
  
        if (isEmpty) {
          return null;
        }

        return {
          year: carValue.year,
          licensePlate: carValue.licensePlate,
          model: carValue.model,
          color: carValue.color
        } as Car;
      }) ?? [];
  
      const filteredCars = rawCars.filter((car): car is Car => car !== null);
  
      const userData: User = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        birthday: formValue.birthday,
        login: formValue.login,
        password: formValue.password,
        phone: formValue.phone
      };
  
      if (filteredCars.length > 0) {
        userData.cars = filteredCars;
      }
  
      this.userService.create(userData).subscribe({
        next: () => {
          this.resetForm();
          this.showSuccess('Usuário criado com sucesso');
        },
        error: () => this.showError('Erro ao criar usuário')
      });
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }
  

  enableEditing(user: User): void {
    this.editingUserId = user.id ?? null;
    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthday: user.birthday,
      login: user.login,
      phone: user.phone ?? ''
    });

    this.carsFormArray.clear();

    user.cars?.forEach(car => this.addCar(car));
  }

  saveUser(userId: number): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
  
      const rawCars = formValue.cars?.map(carGroup => {
        debugger
        const carValue = carGroup;

        const isEmpty =
          (carValue.year == null || carValue.year === 0) &&
          (!carValue.licensePlate || carValue.licensePlate.trim() === '') &&
          (!carValue.model || carValue.model.trim() === '') &&
          (!carValue.color || carValue.color.trim() === '');
        
        if (isEmpty) {
          return null;
        }
        
        return {
          year: carValue.year,
          licensePlate: carValue.licensePlate,
          model: carValue.model,
          color: carValue.color
        } as Car;
      }) ?? [];
  
      const filteredCars = rawCars.filter((car): car is Car => car !== null);
  
      const userData: User = {
        id: userId,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        birthday: formValue.birthday,
        login: formValue.login,
        password: formValue.password,
        phone: formValue.phone,
      };
  
      if (filteredCars.length > 0) {
        userData.cars = filteredCars;
      }
  
      this.userService.update(userId, userData).subscribe({
        next: () => {
          this.resetForm();
          this.showSuccess('Usuário atualizado com sucesso');
        },
        error: () => this.showError('Erro ao atualizar usuário')
      });
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }  

  deleteUser(user: User): void {
    if (confirm(`Tem certeza que deseja excluir ${user.firstName} ${user.lastName}?`)) {
      this.userService.delete(user.id!).subscribe({
        next: () => {
          this.loadUsers();
          this.showSuccess('Usuário excluído com sucesso');
        },
        error: () => this.showError('Erro ao excluir usuário')
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onUserPhotoSelected(event: Event, userId: number | undefined): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    console.log(`Foto selecionada para o usuário ${userId}:`, file);
  }

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset();
    this.carsFormArray.clear();
    this.loadUsers();
  }

  viewUserCars(user: User): void {
    this.router.navigate(['/api/cars'], { state: { user } });
  }

  private markFormGroupTouched(formGroup: AbstractControl): void {
    formGroup.markAsTouched();

    if (formGroup instanceof FormGroup || formGroup instanceof FormArray) {
      Object.values(formGroup.controls).forEach(control => {
        this.markFormGroupTouched(control);
      });
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  getSafeControl(carGroup: AbstractControl, controlName: string): FormControl {
    const control = carGroup.get(controlName);
    if (!control) {
      throw new Error(`Controle ${controlName} não encontrado`);
    }
    return control as FormControl;
  }
}
