import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class CarService {
  private baseUrl = '/api/cars';

  constructor(
    private http: HttpClient
  ) {}

  getAllCars(userId?: number): Observable<Car[]> {
    const url = userId ? `${this.baseUrl}?userId=${userId}` : this.baseUrl;
    return this.http.get<Car[]>(url);
  }

  getById(id: number, userId: number): Observable<Car> {
    return this.http.get<Car>(`${this.baseUrl}/${id}?userId=${userId}`);
  }  

  createCar(car: Car, userId?: number): Observable<Car> {
    if (userId) {
      return this.http.post<Car>(`${this.baseUrl}?userId=${userId}`, car);
    }
    return this.http.post<Car>(this.baseUrl, car);
  }

  updateCar(id: number, car: Car, userId: number): Observable<Car> {
    return this.http.put<Car>(`${this.baseUrl}/${id}?userId=${userId}`, car);
  }
  
  deleteCar(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}?userId=${userId}`);
  }  

  getCarPhoto(carId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${carId}/photo`, {
      responseType: 'blob'
    });
  }

  uploadCarPhoto(carId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/${carId}/photo`, formData);
  }
  
}
