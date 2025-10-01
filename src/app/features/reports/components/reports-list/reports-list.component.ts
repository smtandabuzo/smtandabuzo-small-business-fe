import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ReportService, ReportSummary, ReportFilter, PaymentSummary } from '../../services/report.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatIconModule
  ],
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {
  loading = false;
  error: string | null = null;
  
  // Filter options
  groupByOptions = [
    { value: 'day', label: 'Daily' },
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' }
  ];
  
  // Form model
  filters: ReportFilter = {
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
    groupBy: 'month'
  };
  
  // Report data
  reportData: ReportSummary | null = null;
  
  // Table data
  displayedColumns: string[] = ['period', 'invoices', 'totalAmount', 'paidAmount', 'outstanding'];
  
  // Chart references
  private invoiceChart: Chart | null = null;
  private paymentChart: Chart | null = null;

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;
    this.error = null;
    
    this.reportService.getInvoiceSummary(this.filters).subscribe({
      next: (data) => {
        this.reportData = data;
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading report:', err);
        this.error = 'Failed to load report data. Please try again later.';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadReport();
  }

  private updateCharts(): void {
    if (!this.reportData) return;
    
    this.updateInvoiceChart();
    this.updatePaymentChart();
  }

  private updateInvoiceChart(): void {
    const canvas = document.getElementById('invoiceChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (this.invoiceChart) {
      this.invoiceChart.destroy();
    }
    
    if (!this.reportData) return;
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: [this.reportData.period],
        datasets: [
          {
            label: 'Total Invoices',
            data: [this.reportData.totalInvoiceAmount],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Paid Amount',
            data: [this.reportData.totalPaidAmount],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    
    this.invoiceChart = new Chart(ctx, config);
  }

  private updatePaymentChart(): void {
    if (!this.reportData?.paymentSummary?.length) return;
    
    const canvas = document.getElementById('paymentChart') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (this.paymentChart) {
      this.paymentChart.destroy();
    }
    
    const paymentData = this.reportData.paymentSummary;
    
    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: paymentData.map((p: PaymentSummary) => p.paymentMethod),
        datasets: [{
          data: paymentData.map((p: PaymentSummary) => p.percentage),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw as number;
                const payment = paymentData.find((p: PaymentSummary) => p.paymentMethod === label);
                return `${label}: ${value}% (${payment?.count} payments, ${payment?.totalAmount} total)`;
              }
            }
          }
        }
      }
    };
    
    this.paymentChart = new Chart(ctx, config);
  }
}
