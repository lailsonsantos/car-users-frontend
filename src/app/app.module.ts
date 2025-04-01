import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { LoginComponent } from './auth/login/login.component';
import { UserRegistrationComponent } from './user/user-registration/user-registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './user/users/users.component';
import { CarsComponent } from './car/cars/cars.component';

import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';
import { CarService } from './car/car.service';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UserRegistrationComponent,
    DashboardComponent,
    UsersComponent,
    CarsComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [
    AuthGuard,
    AuthService,
    UserService,
    CarService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
