import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgFor, NgIf, DatePipe, AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { fadeAnimation, listAnimation } from '../../shared/animations';
import { BehaviorSubject, Observable, catchError, combineLatest, debounceTime, map, of, startWith, switchMap } from 'rxjs';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DatePipe, FormsModule, AsyncPipe],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss'],
  animations: [fadeAnimation, listAnimation]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  
  // Observables for reactive filtering
  private employeesSubject = new BehaviorSubject<Employee[]>([]);
  private searchTermSubject = new BehaviorSubject<string>('');
  private countryFilterSubject = new BehaviorSubject<string>('');
  private cityFilterSubject = new BehaviorSubject<string>('');
  private refreshSubject = new BehaviorSubject<void>(undefined);
  
  // Exposed to template
  filteredEmployees$!: Observable<Employee[]>;
  countries: string[] = [];
  cities: string[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  employeeToDelete: number | null = null;
  deleteModal: any;
  
  // Bound to form controls
  searchTerm = '';
  selectedCountry = '';
  selectedCity = '';

  ngOnInit(): void {
    this.setupFilterPipeline();
    this.refreshData();
  }

  private setupFilterPipeline(): void {
    // Main data stream
    const data$ = this.refreshSubject.pipe(
      switchMap(() => {
        this.isLoading = true;
        this.errorMessage = null;
        return this.employeeService.getAllEmployees().pipe(
          catchError(error => {
            console.error('Error loading employees:', error);
            this.errorMessage = 'Failed to load employees. Please try again.';
            this.isLoading = false;
            return of([]);
          })
        );
      })
    );

    // Subscribe to data stream to update employee list
    data$.subscribe(employees => {
      this.employeesSubject.next(employees);
      
      // Extract unique countries and cities
      this.countries = [...new Set(employees.map(e => e.country).filter(Boolean))];
      this.cities = [...new Set(employees.map(e => e.city).filter(Boolean))];
      
      this.isLoading = false;
    });

    // Create filtered stream
    this.filteredEmployees$ = combineLatest([
      this.employeesSubject,
      this.searchTermSubject.pipe(debounceTime(300)),
      this.countryFilterSubject,
      this.cityFilterSubject
    ]).pipe(
      map(([employees, term, country, city]) => {
        return employees.filter(employee => {
          // Apply search term filter
          const matchesTerm = !term || 
            employee.name.toLowerCase().includes(term.toLowerCase()) ||
            employee.emailId.toLowerCase().includes(term.toLowerCase()) ||
            (employee.city && employee.city.toLowerCase().includes(term.toLowerCase())) ||
            (employee.country && employee.country.toLowerCase().includes(term.toLowerCase()));
          
          // Apply country filter
          const matchesCountry = !country || employee.country === country;
          
          // Apply city filter
          const matchesCity = !city || employee.city === city;
          
          return matchesTerm && matchesCountry && matchesCity;
        });
      })
    );
  }

  refreshData(): void {
    this.refreshSubject.next();
  }

  applySearchFilter(term: string): void {
    this.searchTerm = term;
    this.searchTermSubject.next(term);
  }

  filterByCountry(country: string): void {
    this.selectedCountry = country;
    this.countryFilterSubject.next(country);
  }

  filterByCity(city: string): void {
    this.selectedCity = city;
    this.cityFilterSubject.next(city);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCountry = '';
    this.selectedCity = '';
    this.searchTermSubject.next('');
    this.countryFilterSubject.next('');
    this.cityFilterSubject.next('');
  }

  deleteEmployee(id: number | undefined): void {
    if (id === undefined) return;
    
    this.employeeToDelete = id;
    
    // Initialize and show Bootstrap modal
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      this.deleteModal = new bootstrap.Modal(modalElement);
      this.deleteModal.show();
    }
  }

  confirmDelete(): void {
    if (this.employeeToDelete === null) return;
    
    this.employeeService.deleteEmployee(this.employeeToDelete).subscribe({
      next: () => {
        // Close modal
        if (this.deleteModal) {
          this.deleteModal.hide();
        }
        
        // Show success message (you could use a toast service here)
        this.showToast('Employee deleted successfully', 'success');
        
        // Refresh data
        this.refreshData();
        
        // Reset
        this.employeeToDelete = null;
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.showToast('Failed to delete employee. Please try again.', 'danger');
      }
    });
  }

  private showToast(message: string, type: string): void {
    // Create toast element
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast show bg-${type} text-white`;
    toast.role = 'alert';
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="toast-header">
        <strong class="me-auto">Notification</strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">${message}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}