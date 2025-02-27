import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe, JsonPipe } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { fadeAnimation } from '../../shared/animations';

declare var bootstrap: any; // For Bootstrap modal

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [RouterLink, NgIf, DatePipe, JsonPipe],
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.scss'],
  animations: [fadeAnimation]
})
export class EmployeeDetailsComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  employee: Employee = {
    name: '',
    emailId: '',
    city: '',
    country: '',
    dateOfEntry: ''
  };
  isLoading: boolean = true;
  errorMessage: string | null = null;
  deleteModal: any;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.loadEmployeeDetails(+params['id']);
      } else {
        this.router.navigate(['/employees']);
      }
    });
  }

  loadEmployeeDetails(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployeeById(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching employee details:', error);
        this.errorMessage = 'Failed to load employee details.';
        this.isLoading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getTimeAtCompany(dateString: string): string {
    if (!dateString) return 'N/A';
    
    const joinDate = new Date(dateString);
    const today = new Date();
    
    const yearDiff = today.getFullYear() - joinDate.getFullYear();
    const monthDiff = today.getMonth() - joinDate.getMonth();
    
    if (yearDiff > 0) {
      return `${yearDiff} year${yearDiff !== 1 ? 's' : ''}${monthDiff > 0 ? `, ${monthDiff} month${monthDiff !== 1 ? 's' : ''}` : ''}`;
    } else if (monthDiff > 0) {
      return `${monthDiff} month${monthDiff !== 1 ? 's' : ''}`;
    } else {
      const dayDiff = today.getDate() - joinDate.getDate();
      return `${dayDiff < 0 ? 0 : dayDiff} day${dayDiff !== 1 ? 's' : ''}`;
    }
  }

  deleteEmployee(): void {
    // Initialize and show Bootstrap modal
    const modalElement = document.getElementById('deleteModal');
    if (modalElement) {
      this.deleteModal = new bootstrap.Modal(modalElement);
      this.deleteModal.show();
    }
  }

  confirmDelete(): void {
    if (!this.employee.id) return;
    
    this.employeeService.deleteEmployee(this.employee.id).subscribe({
      next: () => {
        // Close modal
        if (this.deleteModal) {
          this.deleteModal.hide();
        }
        
        this.showToast('Employee deleted successfully', 'success');
        this.router.navigate(['/employees']);
      },
      error: (error) => {
        console.error('Error deleting employee:', error);
        this.showToast('Failed to delete employee. Please try again.', 'danger');
      }
    });
  }

  navigateToList(): void {
    this.router.navigate(['/employees']);
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