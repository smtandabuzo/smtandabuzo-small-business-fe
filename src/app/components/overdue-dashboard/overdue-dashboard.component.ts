import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../services/invoice.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-overdue-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overdue-dashboard.component.html',
  styleUrls: ['./overdue-dashboard.component.css']
})
export class OverdueDashboardComponent implements OnInit {
  overdueInvoices: Invoice[] = [];
  totalOverdue = 0;
  isLoading = true;
  error: string | null = null;

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit(): void {
    this.loadOverdueInvoices();
  }

  loadOverdueInvoices(): void {
    this.isLoading = true;
    this.error = null;

    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        const today = new Date();
        this.overdueInvoices = invoices.filter(invoice => {
          const dueDate = new Date(invoice.dueDate);
          return dueDate < today && invoice.status !== 'PAID';
        });
        this.totalOverdue = this.overdueInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading overdue invoices:', error);
        this.error = 'Failed to load overdue invoices. Please try again later.';
        this.isLoading = false;
      }
    });
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

  getDaysOverdue(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
