import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${environment.apiBaseUrl}/employees`;
  private http = inject(HttpClient);

  // Create new employee
  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get all employees
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get employee by ID
  getEmployeeById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Update employee
  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/${id}`, employee)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Delete employee
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get employees by city
  getEmployeesByCity(city: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/city/${city}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get employees by country
  getEmployeesByCountry(country: string): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/country/${country}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    
    if (error.status === 0) {
      // A client-side or network error occurred
      errorMessage = 'Network error occurred. Please check your connection.';
      console.error('Network error:', error.error);
    } else {
      // The backend returned an unsuccessful response code
      errorMessage = `Server returned code ${error.status}, error message: ${error.error.message || error.statusText}`;
      console.error('Backend error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}