import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { PaymentService, PaymentMethod } from '../../services/payment.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface PaymentDialogData {
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSnackBarModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  paymentMethods: {value: string, label: string}[] = [];
  today = new Date().toISOString().split('T')[0];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.paymentForm = this.fb.group({
      amount: [data.amount, [Validators.required, Validators.min(0.01)]],
      paymentDate: [this.today, Validators.required],
      paymentMethod: [PaymentMethod.CREDIT_CARD, Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.paymentMethods = this.paymentService.getPaymentMethods();
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const paymentData = {
      ...this.paymentForm.value,
      invoiceId: this.data.invoiceId
    };

    this.paymentService.recordPayment(paymentData).subscribe({
      next: () => {
        this.snackBar.open('Payment recorded successfully!', 'Close', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error recording payment:', error);
        this.snackBar.open(
          error.error?.message || 'Failed to record payment. Please try again.',
          'Close',
          { duration: 5000, panelClass: 'error-snackbar' }
        );
        this.isLoading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
