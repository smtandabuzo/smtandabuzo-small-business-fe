import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CreateInvoiceDto, Invoice } from '../models/invoice.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {
    console.log('InvoiceService initialized');
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  createInvoice(invoice: CreateInvoiceDto): Observable<Invoice> {
    console.log('Sending invoice data:', JSON.stringify(invoice, null, 2));
    return this.http.post<Invoice>(this.apiUrl, invoice).pipe(
      tap(response => {
        console.log('Invoice created successfully:', response);
      }),
      catchError(error => {
        console.error('Error creating invoice:', error);
        if (error.error) {
          console.error('Error details:', error.error);
        }
        return this.handleError(error);
      })
    );
  }

  updateInvoice(id: string, invoice: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
