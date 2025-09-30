import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Payment {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  invoiceId: number;
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CASH = 'CASH',
  CHECK = 'CHECK',
  OTHER = 'OTHER'
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = 'http://small-business-alb-221567162.eu-north-1.elb.amazonaws.com/api/payments';

  constructor(private http: HttpClient) {}

  recordPayment(payment: Payment): Observable<any> {
    return this.http.post(this.apiUrl, payment);
  }

  getPaymentMethods(): {value: string, label: string}[] {
    return [
      { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card' },
      { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer' },
      { value: PaymentMethod.CASH, label: 'Cash' },
      { value: PaymentMethod.CHECK, label: 'Check' },
      { value: PaymentMethod.OTHER, label: 'Other' }
    ];
  }
}
