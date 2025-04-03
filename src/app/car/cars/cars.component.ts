import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { CarService } from '../../core/services/car.service';

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
  cars: any[] = [];
  editingCarId: number | null = null;

  constructor(private fb: FormBuilder, private carService: CarService) {
    this.carForm = this.fb.group({
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/)]],
      model: ['', Validators.required],
      color: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.carService.getAllCars().subscribe(data => {
      this.cars = data;
    });
  }

  onSubmit() {
    if (this.carForm.valid) {
      this.carService.createCar(this.carForm.value).subscribe(response => {
        this.loadCars();
        this.carForm.reset();
      });
    }
  }

  enableEditing(car: any) {
    this.editingCarId = car.id;
    this.carForm.patchValue(car);
  }

  saveCar(carId: number) {
    if (this.carForm.valid) {
      this.carService.updateCar(carId, this.carForm.value).subscribe(response => {
        this.editingCarId = null;
        this.loadCars();
      });
    }
  }

  deleteCar(carId: number) {
    this.carService.deleteCar(carId).subscribe(() => {
      this.loadCars();
    });
  }

  onCarPhotoSelected(event: any, carId: number) {
    const file: File = event.target.files[0];
    if (file) {
      this.carService.uploadCarPhoto(carId, file).subscribe(response => {
        this.loadCars();
      }, error => {
        console.error('Erro ao enviar foto do carro:', error);
      });
    }
  }
}