import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvoiceDto, Invoice } from '../models/invoice.model';
import { AuthService } from './auth.service';
import { catchError, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = '/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    console.log('InvoiceService initialized with API URL:', this.apiUrl);
  }

  /*private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token found. User might not be logged in.');
      throw new Error('Authentication required. Please log in.');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }*/

  // In your invoice.service.ts
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Authentication required');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getInvoices(): Observable<Invoice[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, {
      headers,
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Error in getInvoices:', error);
        if (error.status === 401) {
          console.error('Authentication failed. Please log in again.');
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }

  createInvoice(invoice: CreateInvoiceDto): Observable<Invoice> {
    try {
      const headers = this.getAuthHeaders();
      // Using camelCase to match the backend's InvoiceRequest DTO
      const payload = {
        customer_name: invoice.customerName,
        customer_email: invoice.customerEmail,
        issue_date: invoice.issueDate,
        due_date: invoice.dueDate,
        amount: invoice.amount,
        status: invoice.status,
        description: invoice.description
      };

      // Format dates to include time portion for proper ISO string conversion
      const formatDate = (dateStr: string): string => {
        // Add time portion to ensure proper timezone handling
        const date = new Date(dateStr);
        // Set to noon UTC to avoid timezone issues
        date.setUTCHours(12, 0, 0, 0);
        return date.toISOString();
      };

      const formattedPayload = {
        ...payload,
        issueDate: formatDate(payload.issue_date),
        dueDate: formatDate(payload.due_date)
      };

      console.log('Sending invoice data:', JSON.stringify(formattedPayload, null, 2));

      return this.http.post<Invoice>(`${this.apiUrl}/invoices`, formattedPayload, {
        headers,
        withCredentials: true // Important for sending cookies/session
      }).pipe(
        catchError(error => {
          console.error('Full error response:', JSON.stringify(error, null, 2));
          console.error('Error creating invoice:', error);
          if (error.status === 401) {
            console.error('Authentication failed. Please log in again.');
            // You might want to redirect to login here
            // this.router.navigate(['/login']); // Uncomment and inject Router if needed
          }
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error preparing invoice request:', error);
      return throwError(() => error);
    }
  }

  /*getInvoices(): Observable<Invoice[]> {
    try {
      const headers = this.getAuthHeaders();
      console.log('Fetching invoices with headers:', headers);
      return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`, {
        headers,
        withCredentials: true // Ensure credentials are included
      }).pipe(
        catchError(error => {
          console.error('Error in getInvoices API call:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            url: error.url,
            headers: error.headers
          });
          return throwError(() => new Error('Failed to load invoices. Please try again later.'));
        })
      );
    } catch (error) {
      console.error('Error preparing invoices request:', error);
      return throwError(() => new Error('Failed to prepare invoices request.'));
    }
  }
*/
  getInvoice(id: string): Observable<Invoice> {
    const headers = this.getAuthHeaders();
    return this.http.get<Invoice>(`${this.apiUrl}/invoices/${id}`, { headers });
  }
}
