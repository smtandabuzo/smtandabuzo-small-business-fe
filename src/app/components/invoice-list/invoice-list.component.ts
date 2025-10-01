import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InvoiceService } from '../../services/invoice.service';
import { PaymentService, PaymentMethod } from '../../services/payment.service';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule
  ],
  templateUrl: './invoice-list.component.html',
  styles: [`
    .status-paid {
      @apply bg-green-100 text-green-800;
    }
    .status-pending {
      @apply bg-yellow-100 text-yellow-800;
    }
    .status-overdue {
      @apply bg-red-100 text-red-800;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  invoices: any[] = [];
  paginatedInvoices: any[] = [];
  isLoading = true;
  error: string | null = null;
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  constructor(
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  viewInvoice(id: string): void {
    this.router.navigate(['/invoices', id]);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  formatAmount(amount: number): string {
    return amount ? amount.toFixed(2) : '0.00';
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.error = null;

    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.totalPages = Math.max(1, Math.ceil(this.invoices.length / this.itemsPerPage));
        this.updatePaginatedInvoices();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        
        let errorMessage = 'Failed to load invoices. ';
        
        if (error.status === 401) {
          errorMessage += 'Please log in again.';
          // Optionally redirect to login
          // this.router.navigate(['/login']);
        } else if (error.status === 500) {
          errorMessage += 'Server error occurred. Please try again later or contact support if the problem persists.';
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        this.error = errorMessage;
        this.isLoading = false;
        
        // Show error toast
        this.snackBar.open(errorMessage, 'Dismiss', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  updatePaginatedInvoices(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedInvoices = this.invoices.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedInvoices();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedInvoices();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedInvoices();
    }
  }

  openPaymentDialog(invoice: any): void {
    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.remainingAmount || invoice.totalAmount,
        dueDate: invoice.dueDate
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Refresh the invoice list to show updated status
        this.loadInvoices();
        this.snackBar.open('Payment recorded successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return 'status-paid';
      case 'OVERDUE':
        return 'status-overdue';
      case 'PENDING':
      default:
        return 'status-pending';
    }
  }
}
