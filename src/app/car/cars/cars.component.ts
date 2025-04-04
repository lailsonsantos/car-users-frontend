import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
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
  currentUserId: any;
  selectedCarPhoto: File | null = null;
  previewPhotoUrl: string | null = null;
  currentYear = new Date().getFullYear();

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
      const carData: Car = {
        year: this.carForm.value.year,
        licensePlate: this.carForm.value.licensePlate,
        model: this.carForm.value.model,
        color: this.carForm.value.color
      };
  
      const carObservable = this.editingCarId
        ? this.carService.updateCar(this.editingCarId, carData)
        : this.carService.createCar(carData, this.currentUserId);
  
      carObservable.subscribe({
        next: (car) => {
          if (this.selectedCarPhoto && car.id) {
            this.carService.uploadCarPhoto(car.id, this.selectedCarPhoto).subscribe({
              next: () => {
                this.loadCars(this.currentUserId);
                this.showSuccess('Foto do carro enviada com sucesso');
              },
              error: (err) => this.showError('Erro ao enviar foto do carro')
            });
          }
  
          this.resetForm();
          this.showSuccess(this.editingCarId ? 'Carro atualizado com sucesso' : 'Carro criado com sucesso');
        },
        error: () => this.showError(this.editingCarId ? 'Erro ao atualizar carro' : 'Erro ao criar carro')
      });
    } else {
      this.markFormGroupTouched(this.carForm);
    }
  }

  enableEditing(car: Car): void {
    this.editingCarId = car.id ?? null;
    this.carForm.patchValue({
      year: car.year,
      licensePlate: car.licensePlate,
      model: car.model,
      color: car.color
    });

    if (car.photoUrl) {
      this.previewPhotoUrl = car.photoUrl;
    } else {
      this.previewPhotoUrl = null;
    }
  }

  saveCar(carId: number): void {
    debugger
    if (this.carForm.valid) {
      const carData: Car = {
        id: carId,
        year: this.carForm.value.year,
        licensePlate: this.carForm.value.licensePlate,
        model: this.carForm.value.model,
        color: this.carForm.value.color
      };

      this.carService.updateCar(carId, carData).subscribe({
        next: () => {
          if (this.selectedCarPhoto) {
            this.carService.uploadCarPhoto(carId, this.selectedCarPhoto).subscribe({
              next: () => {
                this.loadCars(this.currentUserId);
                this.showSuccess('Foto do carro atualizada com sucesso');
              },
              error: (err) => this.showError('Erro ao atualizar foto do carro')
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
    if (confirm(`Tem certeza que deseja excluir o carro ${car.model}?`)) {
      this.carService.deleteCar(car.id!).subscribe({
        next: () => {
          this.loadCars(this.currentUserId);
          this.showSuccess('Carro excluído com sucesso');
        },
        error: () => this.showError('Erro ao excluir carro')
      });
    }
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

  private markFormGroupTouched(formGroup: AbstractControl): void {
    formGroup.markAsTouched();

    if (formGroup instanceof FormGroup) {
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

  getSafeControl(controlName: string): AbstractControl {
    const control = this.carForm.get(controlName);
    if (!control) {
      throw new Error(`Controle ${controlName} não encontrado`);
    }
    return control;
  }
}