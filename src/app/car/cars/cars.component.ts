import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarService } from '../../core/services/car.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { Car } from '../../core/models/car.model';

@Component({
  selector: 'app-cars',
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
  templateUrl: './cars.component.html',
  styleUrls: ['./cars.component.scss']
})
export class CarsComponent implements OnInit {
  carForm: FormGroup;
  cars: Car[] = [];
  editingCarId: number | null = null;
  editingCar: Car | null = null;
  currentUserId: any;
  selectedCarPhoto: File | null = null;
  previewPhotoUrl: string | null = null;
  currentYear = new Date().getFullYear();
  formErrors: { [key: string]: string } = {};
  searchCarId: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private carService: CarService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.carForm = this.fb.group({
      year: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear)]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/)]],
      model: ['', Validators.required],
      color: ['', Validators.required]
    });
  }
  
  formatLicensePlate(event: any): void {
    const control = this.carForm.get('licensePlate');
    if (control) {
      let value = event.target.value.toUpperCase();
      value = value.replace(/[^A-Z0-9]/g, '');
      control.setValue(value, { emitEvent: false });
    }
  }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    const stateUser = navigation?.extras?.state?.['user'];
    
    this.currentUserId = stateUser?.id || this.authService.getUserId();
    
    if (!this.currentUserId) {
      this.showError('Usuário não identificado');
      this.router.navigate(['/api/signin']);
      return;
    }
  
    this.loadCars(this.currentUserId);
  }

  get isEditing(): boolean {
    return this.editingCarId !== null;
  }

  loadCars(userId?: number): void {
    this.carService.getAllCars(userId).subscribe({
      next: (data) => {
        this.cars = data.map(car => {
          if (car.photoUrl && car.id) {
            this.carService.getCarPhoto(car.id).subscribe(blob => {
              const reader = new FileReader();
              reader.onload = (e: any) => {
                car.photoUrl = e.target.result;
              };
              reader.readAsDataURL(blob);
            });
          }
          return car;
        });
      },
      error: (err) => this.showError('Erro ao carregar carros')
    });
  }

  onSubmit(): void {
    if (this.carForm.valid) {
      const carData: Car = this.carForm.value;
      
      this.carService.createCar(carData, this.currentUserId).subscribe({
        next: (car) => {
          if (this.selectedCarPhoto && car.id) {
            this.uploadCarPhoto(car.id);
          } else {
            this.resetForm();
            this.showSuccess('Carro criado com sucesso');
          }
        },
        error: (err) => {
          this.showError(err);
          if (err.error?.errors) {
            this.handleBackendErrors(err.error.errors);
          }
        }
      });      
    } else {
      this.markFormGroupTouched(this.carForm);
      this.showError('Por favor, corrija os erros no formulário');
    }
  }

  private uploadCarPhoto(carId: number): void {
    if (!this.selectedCarPhoto) return;
    
    this.carService.uploadCarPhoto(carId, this.selectedCarPhoto).subscribe({
      next: () => {
        this.resetForm();
        this.showSuccess('Carro e foto salvos com sucesso');
      },
      error: (err) => {
        this.showError(err.message || 'Erro ao enviar foto do carro');
      }
    });
  }

  private markFormGroupTouched(formGroup: AbstractControl): void {
    formGroup.markAsTouched();

    if (formGroup instanceof FormGroup) {
      Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control?.invalid) {
          this.formErrors[key] = this.getErrorMessage(control, key);
        }
      });
    }
  }

  enableEditing(car: Car): void {
    this.editingCarId = car.id ?? null;
    this.editingCar = car;

    this.carForm.patchValue({
      year: car.year,
      licensePlate: car.licensePlate,
      model: car.model,
      color: car.color
    });
    
    this.previewPhotoUrl = null;
    this.selectedCarPhoto = null;
  }

  saveCar(carId: number): void {
    if (this.carForm.valid) {
      const carData: Car = {
        id: carId,
        year: this.carForm.value.year,
        licensePlate: this.carForm.value.licensePlate,
        model: this.carForm.value.model,
        color: this.carForm.value.color
      };
  
      this.carService.updateCar(carId, carData, this.currentUserId).subscribe({
        next: () => {
          if (this.selectedCarPhoto) {
            this.carService.uploadCarPhoto(carId, this.selectedCarPhoto).subscribe({
              next: () => {
                this.loadCars(this.currentUserId);
                this.showSuccess('Foto do carro atualizada com sucesso');
              },
              error: (err) => this.showError(err.message || 'Erro ao atualizar foto do carro')
            });
          }
          this.resetForm();
          this.showSuccess('Carro atualizado com sucesso');
        },
        error: () => this.showError('Erro ao atualizar carro')
      });
    } else {
      this.markFormGroupTouched(this.carForm);
    }
  }  

  deleteCar(car: Car): void {
    this.carService.deleteCar(car.id!, this.currentUserId).subscribe({
      next: () => {
        this.loadCars(this.currentUserId);
        this.showSuccess('Carro excluído com sucesso');
      },
      error: () => this.showError('Erro ao excluir carro')
    });
  }  

  cancelEdit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.editingCarId = null;
    this.carForm.reset();
    this.selectedCarPhoto = null;
    this.previewPhotoUrl = null;
    this.loadCars(this.currentUserId);
  }

  onCarPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedCarPhoto = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewPhotoUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
  }

  private showError(error: any): void {
    const message = error || 'Erro desconhecido';
    this.snackBar.open(message, 'Fechar', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
  }

  getSafeControl(controlName: string): AbstractControl {
    const control = this.carForm.get(controlName);
    if (!control) {
      throw new Error(`Controle ${controlName} não encontrado`);
    }
    return control;
  }

  private getErrorMessage(control: AbstractControl, fieldName: string): string {
    if (control.hasError('required')) {
      return 'Campo obrigatório';
    } else if (control.hasError('pattern')) {
      if (fieldName === 'licensePlate') {
        return 'Formato: ABC1D23';
      }
      return 'Formato inválido';
    } else if (control.hasError('min') || control.hasError('max')) {
      return `Ano deve ser entre 1900 e ${new Date().getFullYear()}`;
    }
    return 'Valor inválido';
  }

  private handleBackendErrors(errors: any): void {
    Object.keys(errors).forEach(key => {
      const control = this.carForm.get(key);
      if (control) {
        control.setErrors({ backendError: true });
        this.formErrors[key] = errors[key];
      }
    });
  }
  
  searchCar(): void {
    if (this.searchCarId) {
      const carId = Number(this.searchCarId);
      this.carService.getById(carId, this.currentUserId).subscribe({
        next: (car) => {
          if (car) {
            if (car.photoUrl && car.id) {
              this.carService.getCarPhoto(car.id).subscribe(blob => {
                const reader = new FileReader();
                reader.onload = (e: any) => {
                  car.photoUrl = e.target.result;
                  this.cars = [car];
                };
                reader.readAsDataURL(blob);
              });
            } else {
              this.cars = [car];
            }
          } else {
            this.cars = [];
            this.showError('Carro não encontrado');
          }
        },
        error: () => {
          this.cars = [];
          this.showError('Carro não encontrado');
        }
      });
    } else {
      this.loadCars(this.currentUserId);
    }
  }
  
}