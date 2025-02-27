import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./components/dashboard/dashboard.component')
      .then(c => c.DashboardComponent),
    title: 'Dashboard - Employee Management'
  },
  { 
    path: 'employees', 
    loadComponent: () => import('./components/employee-list/employee-list.component')
      .then(c => c.EmployeeListComponent),
    title: 'Employee List - Employee Management'
  },
  { 
    path: 'employees/new', 
    loadComponent: () => import('./components/employee-form/employee-form.component')
      .then(c => c.EmployeeFormComponent),
    title: 'Add Employee - Employee Management'
  },
  { 
    path: 'employees/edit/:id', 
    loadComponent: () => import('./components/employee-form/employee-form.component')
      .then(c => c.EmployeeFormComponent),
    title: 'Edit Employee - Employee Management'
  },
  { 
    path: 'employees/details/:id', 
    loadComponent: () => import('./components/employee-details/employee-details.component')
      .then(c => c.EmployeeDetailsComponent),
    title: 'Employee Details - Employee Management'
  },
  { path: '**', redirectTo: 'dashboard' }
];