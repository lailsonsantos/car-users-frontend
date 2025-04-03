import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CarService {
  private baseUrl = '/api/cars';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getAllCars(userId?: number): Observable<Car[]> {
    const url = userId ? `${this.baseUrl}?userId=${userId}` : this.baseUrl;
    return this.http.get<Car[]>(url);
  }

  getById(id: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}`);
  }

  createCar(car: Car): Observable<Car> {
    return this.http.post<Car>(this.baseUrl, car);
  }

  updateCar(id: number, car: Car): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}`, car);
  }

  deleteCar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadCarPhoto(carId: number, file: File): Observable<any> {
      const formData = new FormData();
      formData.append('file', file);
      return this.http.post(`${this.baseUrl}/${carId}/photo`, formData);
    }
}
