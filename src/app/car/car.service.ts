import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = '/api/cars';

  constructor(private http: HttpClient) {}

  createCar(car: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, car);
  }

  getAllCars(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateCar(carId: number, car: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${carId}`, car);
  }

  deleteCar(carId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${carId}`);
  }

  uploadCarPhoto(carId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${carId}/photo`, formData);
  }
}
