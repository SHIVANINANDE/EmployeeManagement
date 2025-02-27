import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { slideInAnimation } from '../../shared/animations';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [slideInAnimation]
})
export class DashboardComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  
  totalEmployees: number = 0;
  uniqueCountries: number = 0;
  uniqueCities: number = 0;
  recentEmployees: Employee[] = [];
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;
    
    this.employeeService.getAllEmployees()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (employees) => {
          this.totalEmployees = employees.length;
          
          // Calculate unique countries
          const countries = new Set(employees.map(e => e.country).filter(Boolean));
          this.uniqueCountries = countries.size;
          
          // Calculate unique cities
          const cities = new Set(employees.map(e => e.city).filter(Boolean));
          this.uniqueCities = cities.size;
          
          // Get most recent employees (by date of entry)
          this.recentEmployees = employees
            .sort((a, b) => new Date(b.dateOfEntry).getTime() - new Date(a.dateOfEntry).getTime())
            .slice(0, 5);
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.hasError = true;
          this.errorMessage = error.message || 'Failed to load dashboard data. Please try again later.';
        }
      });
  }
}