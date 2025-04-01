
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private baseUrl = '/api/cars';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Car[]> {
    return this.http.get<Car[]>(this.baseUrl);
  }

  getById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  create(car: Car): Observable<Car> {
    return this.http.post<Car>(this.baseUrl, car);
  }

  update(id: number, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}`, car);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
