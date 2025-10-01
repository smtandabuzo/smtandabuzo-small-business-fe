import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReportSummary {
  period: string;
  totalInvoices: number;
  totalInvoiceAmount: number;
  totalPaidAmount: number;
  totalOutstanding: number;
  paymentSummary: PaymentSummary[];
}

export interface PaymentSummary {
  paymentMethod: string;
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface ReportFilter {
  startDate?: Date;
  endDate?: Date;
  groupBy: 'day' | 'week' | 'month' | 'year';
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/reports`;

  constructor(private http: HttpClient) {}

  getInvoiceSummary(filters: ReportFilter): Observable<ReportSummary> {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate.toISOString());
    }
    
    params = params.set('groupBy', filters.groupBy);

    return this.http.get<ReportSummary>(`${this.apiUrl}/invoice-summary`, { params });
  }

  getPaymentSummary(filters: ReportFilter): Observable<PaymentSummary[]> {
    let params = new HttpParams();
    
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate.toISOString());
    }
    
    return this.http.get<PaymentSummary[]>(`${this.apiUrl}/payment-summary`, { params });
  }
}
