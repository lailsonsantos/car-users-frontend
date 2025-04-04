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
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { Car } from '../../core/models/car.model';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';
import { CarService } from '../../core/services/car.service';

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
    CommonModule,
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
  selectedUserPhoto: File | null = null;
  carFiles: File[] = [];
  previewPhotoUrl: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private carService: CarService
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
      this.users = data.map(user => {
        if (user.photoUrl) {
          this.userService.getPhoto(user.id!).subscribe(blob => {
            const reader = new FileReader();
            reader.onload = (e: any) => {
              user.photoUrl = e.target.result;
            };
            reader.readAsDataURL(blob);
          });
        }
        return user;
      });
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
        phone: formValue.phone,
      };

      if (filteredCars.length > 0) {
        userData.cars = filteredCars;
      }

      const userObservable = this.editingUserId
        ? this.userService.update(this.editingUserId, userData)
        : this.userService.create(userData);

      userObservable.subscribe({
        next: (user) => {
          if (this.selectedUserPhoto && user.id) {
            this.userService.uploadUserPhoto(user.id, this.selectedUserPhoto).subscribe({
              next: (updatedUser) => {
                this.loadUsers();
              },
              error: (err) => console.error('Erro ao enviar foto do usuário:', err)
            });
          }

          if (user.cars && user.cars.length > 0) {
            user.cars.forEach((car, index) => {
              const file = this.carFiles[index];
              if (file && car.id) {
                this.carService.uploadCarPhoto(car.id, file).subscribe({
                  next: () => console.log(`Foto do carro ${car.id} enviada com sucesso.`),
                  error: (err: any) => console.error(`Erro ao enviar foto do carro ${car.id}:`, err)
                });
              }
            });
          }

          this.resetForm();
          this.showSuccess(this.editingUserId ? 'Usuário atualizado com sucesso' : 'Usuário criado com sucesso');
          this.carFiles = [];
          this.selectedUserPhoto = null;
          this.previewPhotoUrl = null;
        },
        error: () => this.showError(this.editingUserId ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário')
      });
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }

  onUserPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedUserPhoto = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewPhotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
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

    if (user.photoUrl) {
      this.previewPhotoUrl = user.photoUrl;
    } else {
      this.previewPhotoUrl = null;
    }

    this.carsFormArray.clear();
    user.cars?.forEach(car => this.addCar(car));
  }

  saveUser(userId: number): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;

      const rawCars = formValue.cars?.map(carGroup => {

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

  resetForm(): void {
    this.editingUserId = null;
    this.userForm.reset();
    this.carsFormArray.clear();
    this.selectedUserPhoto = null;
    this.previewPhotoUrl = null;
    this.loadUsers();
  }

  viewUserCars(user: User): void {
    this.router.navigate(['/api/cars'], { state: { user: user } });
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

  onUserPhotoSelectedForNew(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedUserPhoto = event.target.files[0];
    }
  }

  onCarFileSelected(event: any, index: number): void {
    if (event.target.files && event.target.files.length > 0) {
      this.carFiles[index] = event.target.files[0];
    }
  }

}
