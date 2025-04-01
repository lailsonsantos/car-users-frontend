
import { Component } from '@angular/core';
import { CarService } from '../../core/services/car.service';
import { Router } from '@angular/router';
import { Car } from '../../core/models/car.model';

@Component({
  selector: 'app-register-car',
  template: \`
    <h2>Register Car</h2>
    <form (ngSubmit)="save()">
      <input [(ngModel)]="car.model" name="model" placeholder="Model" required>
      <input [(ngModel)]="car.licensePlate" name="licensePlate" placeholder="License Plate" required>
      <button type="submit">Save</button>
    </form>
  \`
})
export class RegisterCarComponent {
  car: Car = { model: '', licensePlate: '', color: '', year: 2020 };

  constructor(private service: CarService, private router: Router) {}

  save() {
    this.service.create(this.car).subscribe(() => this.router.navigate(['/cars']));
  }
}
