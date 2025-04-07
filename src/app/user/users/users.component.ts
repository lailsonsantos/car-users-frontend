import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  FormsModule
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
  id: FormControl<number | null>;
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
  photoUrl: FormControl<string | null>;
  cars: FormArray<FormGroup<CarForm>>;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
  formErrors: { [key: string]: string } = {};
  editingUser: User | null = null;
  searchUserId: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private snackBar: MatSnackBar,
    private carService: CarService
  ) {
    this.userForm = this.fb.group<UserForm>({
      firstName: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s']*$/)]),
      lastName: this.fb.control('', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\s']*$/)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      birthday: this.fb.control('', Validators.required),
      login: this.fb.control('', Validators.required),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)]),
      phone: this.fb.control('', Validators.required),
      photoUrl: this.fb.control(''),
      cars: this.fb.array<FormGroup<CarForm>>([], (control: AbstractControl) => {
        if (control instanceof FormArray) {
          return control.length > 0 ? null : { atLeastOneCar: 'É obrigatório informar pelo menos um carro.' };
        }
        return null;
      })
    });
  }

  validateName(event: any, controlName: string): void {
    const control = this.userForm.get(controlName);
    if (control) {
      let value = event.target.value;
      value = value.replace(/[^a-zA-ZÀ-ÿ\s']/g, '');
      control.setValue(value, { emitEvent: false });
    }
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

  formatLicensePlate(event: any, control: AbstractControl): void {
    let value = event.target.value.toUpperCase();
    value = value.replace(/[^A-Z0-9]/g, '');
    control.setValue(value);
  }

  createCarFormGroup(carData?: Partial<Car>): FormGroup<CarForm> {
    return this.fb.group<CarForm>({
      id: this.fb.control(carData?.id ?? null),
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
          id: carValue.id,
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
              next: () => {
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
      this.showError('Por favor, corrija os erros no formulário');
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
    this.editingUser = user;

    this.userForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      birthday: user.birthday,
      login: user.login,
      phone: user.phone,
      photoUrl: ''
    });
  
    if (this.editingUserId) {
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  
    this.previewPhotoUrl = null;
  
    this.carsFormArray.clear();
    user.cars?.forEach(car => this.addCar(car));
  }  

  saveUser(userId: number): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
  
      const mappedCars = formValue.cars?.map((carFormValue: any) => {
        const originalCar = this.editingUser?.cars?.find(c => c.id === carFormValue.id);
        return {
          id: carFormValue.id ?? undefined,
          year: carFormValue.year,
          licensePlate: carFormValue.licensePlate,
          model: carFormValue.model,
          color: carFormValue.color,
          photoUrl: originalCar ? originalCar.photoUrl : undefined
        } as Car;
      }) ?? [];
  
      const updatedUser: User = {
        ...this.editingUser,
        ...formValue,
        cars: mappedCars
      };
  
      this.userService.update(userId, updatedUser).subscribe({
        next: (user) => {
          if (this.selectedUserPhoto) {
            this.userService.uploadUserPhoto(userId, this.selectedUserPhoto).subscribe({
              next: () => {
                this.loadUsers();
                this.showSuccess('Usuário atualizado com foto com sucesso');
                this.selectedUserPhoto = null;
              },
              error: (err) => {
                console.error('Erro ao enviar foto do usuário:', err);
                this.loadUsers();
                this.showSuccess('Usuário atualizado, mas ocorreu erro no upload da foto');
              }
            });
          } else {
            this.loadUsers();
            this.showSuccess('Usuário atualizado com sucesso');
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
        },
        error: (err) => {
          this.showError(err.message || 'Erro ao atualizar usuário');
          if (err.error?.errors) {
            this.handleBackendErrors(err.error.errors);
          }
        }
      });
    } else {
      this.markFormGroupTouched(this.userForm);
    }
  }    

  deleteUser(user: User): void {
    this.userService.delete(user.id!).subscribe({
      next: () => {
        this.loadUsers();
        this.showSuccess('Usuário excluído com sucesso');
      },
      error: () => this.showError('Erro ao excluir usuário')
    });
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
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    localStorage.setItem('redirectUrl', '/api/cars');
    
    this.router.navigate(['/api/signin']);
  }  

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
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

  private markFormGroupTouched(formGroup: AbstractControl): void {
    formGroup.markAsTouched();

    if (formGroup instanceof FormGroup || formGroup instanceof FormArray) {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control?.invalid) {
          this.formErrors[key] = this.getErrorMessage(control, key);
        }
        this.markFormGroupTouched(control!);
      });
    }
  }

  private getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (control.hasError('required')) {
      return 'Campo obrigatório';
    } else if (control.hasError('email')) {
      return 'Email inválido';
    } else if (control.hasError('minlength')) {
      return `Mínimo ${control.errors?.['minlength'].requiredLength} caracteres`;
    } else if (control.hasError('pattern')) {
      if (fieldName === 'licensePlate') {
        return 'Formato: ABC1D23';
      }
      return 'Formato inválido';
    } else if (control.hasError('min') || control.hasError('max')) {
      return `Deve ser entre 1900 e ${this.currentYear}`;
    }
    return 'Valor inválido';
  }

  private showError(error: any): void {
    const message = error?.error?.message || error?.message || 'Erro desconhecido';
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  private handleBackendErrors(errors: any): void {
    Object.keys(errors).forEach(key => {
      const control = this.userForm.get(key);
      if (control) {
        control.setErrors({ backendError: true });
        this.formErrors[key] = errors[key];
      }
    });
  }

  searchUser(): void {
    if (this.searchUserId && this.searchUserId !== '') {
      const id = Number(this.searchUserId);
      this.userService.getById(id).subscribe({
        next: (user) => {
          this.users = [user];
          if (user.photoUrl) {
            this.userService.getPhoto(user.id!).subscribe(blob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                user.photoUrl = e.target.result;
              };
              reader.readAsDataURL(blob);
            });
          }
        },
        error: (err) => {
          const errorMessage =
            err?.error?.message || err?.message || 'Usuário não encontrado';
          this.showError(errorMessage);
        }
      });
    } else {
      this.loadUsers();
    }
  }

}
