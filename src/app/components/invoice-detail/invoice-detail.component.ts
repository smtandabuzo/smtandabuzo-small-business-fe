import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ZarCurrencyPipe } from '../../pipes/zar-currency.pipe';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, ZarCurrencyPipe],
  template: `
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back button -->
      <button 
        (click)="goBack()"
        class="mb-6 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
      >
        <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
        </svg>
        Back to Invoices
      </button>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Invoice Details -->
      <div *ngIf="!isLoading && invoice" class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Header -->
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Invoice #{{ invoice.id }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Issued on {{ invoice.issueDate | date:'fullDate' }}
            </p>
          </div>
          <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium"
            [ngClass]="{
              'bg-green-100 text-green-800': invoice.status === 'PAID',
              'bg-yellow-100 text-yellow-800': invoice.status === 'PENDING',
              'bg-red-100 text-red-800': invoice.status === 'OVERDUE'
            }">
            {{ invoice.status }}
          </span>
        </div>

        <!-- Customer and Dates -->
        <div class="border-b border-gray-200 px-4 py-5 sm:px-6">
          <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
            <div>
              <h4 class="text-sm font-medium text-gray-500">Bill To</h4>
              <p class="mt-1 text-sm text-gray-900">{{ invoice.customerName }}</p>
              <p class="text-sm text-gray-500">{{ invoice.customerEmail }}</p>
            </div>
            <div class="sm:text-right">
              <div class="grid grid-cols-2 gap-x-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Issue Date</h4>
                  <p class="mt-1 text-sm text-gray-900">{{ invoice.issueDate | date:'mediumDate' }}</p>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-500">Due Date</h4>
                  <p class="mt-1 text-sm text-gray-900">{{ invoice.dueDate | date:'mediumDate' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Items -->
        <div class="px-4 py-5 sm:px-6">
          <h4 class="text-sm font-medium text-gray-500 mb-4">Invoice Details</h4>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="whitespace-pre-line text-gray-800">{{ invoice.description }}</p>
          </div>
        </div>

        <!-- Totals -->
        <div class="px-4 py-5 sm:px-6 bg-gray-50 sm:rounded-b-lg">
          <div class="flex justify-end">
            <div class="w-full max-w-xs">
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-sm font-medium text-gray-500">Subtotal</span>
                <span class="text-sm text-gray-900">{{ invoice.amount | zarCurrency }}</span>
              </div>
              <div class="flex justify-between py-2 border-b border-gray-200">
                <span class="text-sm font-medium text-gray-500">Tax (0%)</span>
                <span class="text-sm text-gray-900">{{ 0 | zarCurrency }}</span>
              </div>
              <div class="flex justify-between py-2 font-medium text-gray-900">
                <span>Total</span>
                <span class="text-lg">{{ invoice.amount | zarCurrency }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div *ngIf="!isLoading && invoice" class="mt-6 flex justify-end space-x-3">
        <button 
          type="button" 
          (click)="goBack()"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Back to List
        </button>
        <button 
          type="button" 
          (click)="printInvoice()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd" />
          </svg>
          Print
        </button>
      </div>
    </div>
  `,
  styles: []
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) {
          throw new Error('Invoice ID is required');
        }
        return this.invoiceService.getInvoice(id);
      })
    ).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.error = 'Failed to load invoice details. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/invoices']);
  }

  printInvoice(): void {
    window.print();
  }
}
