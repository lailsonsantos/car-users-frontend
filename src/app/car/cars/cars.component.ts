import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CarService } from '../car.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-cars',
  standalone: true,
    imports: [CommonModule, ReactiveFormsModule, MatCardModule],
  templateUrl: './cars.component.html'
})
export class CarsComponent implements OnInit {
  carForm: FormGroup;
  cars: any[] = [];
  editingCarId: number | null = null;

  constructor(private fb: FormBuilder,
              private carService: CarService) {
    this.carForm = this.fb.group({
      year: ['', Validators.required],
      licensePlate: ['', Validators.required],
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
