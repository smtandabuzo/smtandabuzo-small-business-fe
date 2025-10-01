import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { CreateInvoiceDto } from '../../models/invoice.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">Create New Invoice</h2>
      
      <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Customer Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">
              Customer Name <span class="text-error-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              formControlName="customerName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              [class.border-error-300]="isFieldInvalid('customerName')"
            >
            <div *ngIf="isFieldInvalid('customerName')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('customerName') }}
            </div>
          </div>

          <div>
            <label for="customerEmail" class="block text-sm font-medium text-gray-700 mb-1">
              Customer Email <span class="text-error-500">*</span>
            </label>
            <input
              type="email"
              id="customerEmail"
              formControlName="customerEmail"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              [class.border-error-300]="isFieldInvalid('customerEmail')"
            >
            <div *ngIf="isFieldInvalid('customerEmail')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('customerEmail') }}
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="issueDate" class="block text-sm font-medium text-gray-700 mb-1">
              Issue Date <span class="text-error-500">*</span>
            </label>
            <input
              type="date"
              id="issueDate"
              formControlName="issueDate"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              [class.border-error-300]="isFieldInvalid('issueDate')"
            >
            <div *ngIf="isFieldInvalid('issueDate')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('issueDate') }}
            </div>
          </div>

          <div>
            <label for="dueDate" class="block text-sm font-medium text-gray-700 mb-1">
              Due Date <span class="text-error-500">*</span>
            </label>
            <input
              type="date"
              id="dueDate"
              formControlName="dueDate"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              [class.border-error-300]="isFieldInvalid('dueDate')"
            >
            <div *ngIf="isFieldInvalid('dueDate')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('dueDate') }}
            </div>
          </div>
        </div>

        <!-- Amount & Status -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">
              Amount (USD) <span class="text-error-500">*</span>
            </label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                formControlName="amount"
                class="w-full pl-7 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                [class.border-error-300]="isFieldInvalid('amount')"
                placeholder="0.00"
              >
            </div>
            <div *ngIf="isFieldInvalid('amount')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('amount') }}
            </div>
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">
              Status <span class="text-error-500">*</span>
            </label>
            <select
              id="status"
              formControlName="status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              [class.border-error-300]="isFieldInvalid('status')"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <div *ngIf="isFieldInvalid('status')" class="mt-1 text-sm text-error-600">
              {{ getErrorMessage('status') }}
            </div>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
            Description <span class="text-error-500">*</span>
          </label>
          <textarea
            id="description"
            formControlName="description"
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            [class.border-error-300]="isFieldInvalid('description')"
            placeholder="Enter a description for this invoice..."
          ></textarea>
          <div *ngIf="isFieldInvalid('description')" class="mt-1 text-sm text-error-600">
            {{ getErrorMessage('description') }}
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="isSubmitting"
            class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span *ngIf="!isSubmitting">Create Invoice</span>
            <span *ngIf="isSubmitting" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: []
})
export class InvoiceFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  
  invoiceForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private router: Router
  ) {
    // Initialize the form with default values and validators
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    this.invoiceForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      customerEmail: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      issueDate: [today, [Validators.required]],
      dueDate: [dueDateStr, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      status: ['PENDING', [Validators.required]]
    });
  }

  // Helper method to check if a form field is invalid
  isFieldInvalid(field: string): boolean {
    const control = this.invoiceForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Helper method to get error message for a field
  getErrorMessage(field: string): string {
    const control = this.invoiceForm.get(field);
    
    if (!control || !control.errors) return '';
    
    if (control.hasError('required')) {
      return 'This field is required';
    } else if (control.hasError('email')) {
      return 'Please enter a valid email address';
    } else if (control.hasError('minlength')) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    } else if (control.hasError('maxlength')) {
      return `Maximum length is ${control.errors['maxlength'].requiredLength} characters`;
    } else if (control.hasError('min')) {
      return `Minimum value is ${control.errors['min'].min}`;
    }
    
    return 'Invalid value';
  }

  // Handle form submission
  onSubmit(): void {
    // Mark all fields as touched to trigger validation messages
    this.invoiceForm.markAllAsTouched();
    
    if (this.invoiceForm.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Create a new object with only the fields the backend expects
    const formValue = this.invoiceForm.value;
    const invoiceData: CreateInvoiceDto = {
      customerName: formValue.customerName,
      customerEmail: formValue.customerEmail,
      issueDate: formValue.issueDate,
      dueDate: formValue.dueDate,
      description: formValue.description,
      amount: parseFloat(formValue.amount),
      status: formValue.status
    };

    // Call the service to create the invoice
    this.invoiceService.createInvoice(invoiceData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.created.emit();
        this.router.navigate(['/invoices']);
      },
      error: (error) => {
        console.error('Error creating invoice:', error);
        this.isSubmitting = false;
        this.error = error.message || 'Failed to create invoice. Please try again.';
      }
    });
  }

  // Handle cancel button click
  onCancel(): void {
    this.cancel.emit();
  }
}
