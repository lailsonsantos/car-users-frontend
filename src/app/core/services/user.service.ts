import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private baseUrl = '/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(this.baseUrl, user).pipe(
      catchError(error => {
        if (error.error && error.error.message) {
          throw new Error(error.error.message);
        }
        throw new Error('Erro ao criar usuário');
      })
    );
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.baseUrl}/${id}`, user).pipe(
      catchError(error => {
        if (error.error && error.error.message) {
          throw new Error(error.error.message);
        }
        throw new Error('Erro ao atualizar usuário');
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getMe(): Observable<User> {
    return this.http.get<User>('/api/me');
  }

  getPhoto(userId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${userId}/photo`, {
      responseType: 'blob'
    });
  }

  getPhotoUrl(userId: number): string {
    return `${this.baseUrl}/${userId}/photo`;
  }

  uploadUserPhoto(userId: number, file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.baseUrl}/${userId}/photo`, formData);
  }

}
