
import { Component, OnInit } from '@angular/core';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';

@Component({
  selector: 'app-list-cars',
  template: \`
    <h2>Cars</h2>
    <ul>
      <li *ngFor="let c of cars">{{ c.model }} - {{ c.licensePlate }}</li>
    </ul>
  \`
})
export class ListCarsComponent implements OnInit {
  cars: Car[] = [];

  constructor(private service: CarService) {}

  ngOnInit() {
    this.service.getAll().subscribe(data => this.cars = data);
  }
}
