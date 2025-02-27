import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { EmployeeService } from '../../services/employee.service';
import { Employee } from '../../models/employee.model';
import { slideInAnimation } from '../../shared/animations';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgClass, NgIf],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
  animations: [slideInAnimation]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  employeeForm!: FormGroup;
  isEditMode: boolean = false;
  employeeId?: number;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  submitted: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();
    
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.employeeId = +params['id'];
        this.loadEmployeeData(this.employeeId);
      }
    });
  }

  // Initialize form
  initForm(): void {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      emailId: ['', [Validators.required, Validators.email]],
      city: [''],
      country: [''],
      dateOfEntry: [this.formatDate(new Date())]
    });
  }

  // Getter for easy access to form fields
  get f() { return this.employeeForm.controls; }

  // Load employee data for editing
  loadEmployeeData(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          name: employee.name,
          emailId: employee.emailId,
          city: employee.city,
          country: employee.country,
          dateOfEntry: this.formatDate(new Date(employee.dateOfEntry))
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading employee data:', error);
        this.errorMessage = 'Failed to load employee data.';
        this.isLoading = false;
      }
    });
  }

  // Handle form submission
  onSubmit(): void {
    this.submitted = true;

    // Stop if form is invalid
    if (this.employeeForm.invalid) {
      // Focus the first invalid field
      const firstInvalidElement = document.querySelector('.is-invalid');
      if (firstInvalidElement) {
        (firstInvalidElement as HTMLElement).focus();
      }
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    const employeeData: Employee = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      // Update existing employee
      this.employeeService.updateEmployee(this.employeeId, employeeData).subscribe({
        next: () => {
          this.showToast('Employee updated successfully!', 'success');
          this.navigateToList();
        },
        error: (error) => {
          console.error('Error updating employee:', error);
          this.errorMessage = 'Failed to update employee. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new employee
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.showToast('Employee created successfully!', 'success');
          this.navigateToList();
        },
        error: (error) => {
          console.error('Error creating employee:', error);
          this.errorMessage = 'Failed to create employee. Please try again.';
          this.isSubmitting = false;
        }
      });
    }
  }

  // Navigate back to list
  navigateToList(): void {
    this.router.navigate(['/employees']);
  }

  // Reset form
  resetForm(): void {
    this.submitted = false;
    
    if (this.isEditMode && this.employeeId) {
      this.loadEmployeeData(this.employeeId);
    } else {
      this.employeeForm.reset({
        dateOfEntry: this.formatDate(new Date())
      });
    }
  }

  // Format date for input field
  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
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