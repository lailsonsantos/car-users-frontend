import { Car } from './car.model';

export interface User {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  birthday?: string | null;
  login?: string | null;
  password?: string | null;
  phone?: string | null;
  photoUrl?: string | null;
  createdAt?: string | null;
  lastLogin?: string | null;
  cars?: Car[];
}
