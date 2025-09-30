import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';

export interface PaymentDialogData {
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
}

export interface PaymentMethodOption {
  value: string;
  label: string;
  icon: string;
}

export interface Payment {
  invoiceId: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  cardLastFour?: string;
  cardType?: string;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  providers: [DatePipe],
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
    MatProgressSpinnerModule,
    MatCardModule,
    MatDividerModule,
    MatTooltipModule,
    MatAutocompleteModule
  ],
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.css']
})
export class PaymentDialogComponent implements OnInit {
  paymentForm: FormGroup;
  paymentMethods: PaymentMethodOption[] = [];
  today = new Date();
  maxDate = new Date();
  isLoading = false;
  showCardDetails = false;
  selectedCardType: string | null = null;
  filteredPaymentMethods: Observable<PaymentMethodOption[]> = new Observable();

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private snackBar: MatSnackBar,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {
    this.paymentForm = this.fb.group({
      amount: [
        data.amount,
        [
          Validators.required,
          Validators.min(0.01),
          this.maxAmountValidator(data.amount * 1.1)
        ]
      ],
      paymentDate: [this.today, [Validators.required, this.futureDateValidator()]],
      paymentMethod: [PaymentMethod.CREDIT_CARD, Validators.required],
      cardNumber: ['', [Validators.pattern(/^\d{12,19}$/)]],
      cardExpiry: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
      cardCvv: ['', [Validators.pattern(/^\d{3,4}$/)]],
      reference: ['', [Validators.maxLength(50)]],
      notes: ['', [Validators.maxLength(500)]]
    }, { validators: this.requireCardDetailsIfCreditCard });
  }

  ngOnInit(): void {
    this.paymentMethods = [
      { value: PaymentMethod.CREDIT_CARD, label: 'Credit Card', icon: 'credit_card' },
      { value: PaymentMethod.BANK_TRANSFER, label: 'Bank Transfer', icon: 'account_balance' },
      { value: PaymentMethod.PAYPAL, label: 'PayPal', icon: 'payments' },
      { value: PaymentMethod.CASH, label: 'Cash', icon: 'money' },
      { value: PaymentMethod.CHECK, label: 'Check', icon: 'receipt' },
      { value: PaymentMethod.OTHER, label: 'Other', icon: 'more_horiz' }
    ];

    this.filteredPaymentMethods = this.paymentForm.get('paymentMethod')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterPaymentMethods(value || ''))
    );

    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.showCardDetails = method === PaymentMethod.CREDIT_CARD;
      this.updateValidators();
    });

    this.paymentForm.get('cardNumber')?.valueChanges.subscribe(value => {
      this.detectCardType(value);
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) {
      return;
    }

    this.isLoading = true;
    const payment: Payment = {
      invoiceId: this.data.invoiceId,
      amount: this.paymentForm.value.amount,
      paymentDate: this.datePipe.transform(this.paymentForm.value.paymentDate, 'yyyy-MM-dd') || '',
      paymentMethod: this.paymentForm.value.paymentMethod,
      reference: this.paymentForm.value.reference,
      notes: this.paymentForm.value.notes
    };

    if (this.paymentForm.value.paymentMethod === PaymentMethod.CREDIT_CARD) {
      const cardNumber = this.paymentForm.value.cardNumber.replace(/\D/g, '');
      payment.cardLastFour = cardNumber.slice(-4);
      payment.cardType = this.selectedCardType || '';
    }

    this.paymentService.recordPayment(payment).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.snackBar.open('Payment processed successfully', 'Close', { duration: 5000 });
        this.dialogRef.close({ success: true, payment: response });
      },
      error: (error: any) => {
        this.isLoading = false;
        this.snackBar.open('Error processing payment: ' + error.message, 'Close', { duration: 5000 });
      }
    });
  }

  onCancel(): void {
    if (this.paymentForm.dirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        this.dialogRef.close({ success: false });
      }
    } else {
      this.dialogRef.close({ success: false });
    }
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (this.selectedCardType === 'amex') {
      value = value.replace(/(\d{4})(\d{0,6})(\d{0,5}).*/, (_match: string, g1: string, g2?: string, g3?: string) => {
        let result = g1;
        if (g2) result += ' ' + g2;
        if (g3) result += ' ' + g3;
        return result;
      });
    } else {
      value = value.replace(/(\d{0,4})(\d{0,4})(\d{0,4})(\d{0,4}).*/, (_match: string, g1?: string, g2?: string, g3?: string, g4?: string) => {
        const parts = [g1, g2, g3, g4].filter(Boolean) as string[];
        return parts.join(' ');
      });
    }

    input.value = value.trim();
    this.paymentForm.get('cardNumber')?.setValue(value.trim(), { emitEvent: false });
  }

  formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    input.value = value;
    this.paymentForm.get('cardExpiry')?.setValue(value, { emitEvent: false });
  }

  private updateValidators(): void {
    const cardNumberControl = this.paymentForm.get('cardNumber');
    const cardExpiryControl = this.paymentForm.get('cardExpiry');
    const cardCvvControl = this.paymentForm.get('cardCvv');

    if (this.showCardDetails) {
      cardNumberControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{12,19}$/)
      ]);
      cardExpiryControl?.setValidators([
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)
      ]);
      cardCvvControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{3,4}$/)
      ]);
    } else {
      cardNumberControl?.clearValidators();
      cardExpiryControl?.clearValidators();
      cardCvvControl?.clearValidators();
    }

    cardNumberControl?.updateValueAndValidity();
    cardExpiryControl?.updateValueAndValidity();
    cardCvvControl?.updateValueAndValidity();
  }

  private detectCardType(cardNumber: string): void {
    if (!cardNumber) {
      this.selectedCardType = null;
      return;
    }

    const firstDigit = cardNumber[0];
    switch (firstDigit) {
      case '4':
        this.selectedCardType = 'Visa';
        break;
      case '5':
        this.selectedCardType = 'Mastercard';
        break;
      case '3':
        this.selectedCardType = 'American Express';
        break;
      default:
        this.selectedCardType = null;
    }
  }

  private _filterPaymentMethods(value: string): PaymentMethodOption[] {
    const filterValue = value.toLowerCase();
    return this.paymentMethods.filter(option =>
      option.label.toLowerCase().includes(filterValue) ||
      option.value.toLowerCase().includes(filterValue)
    );
  }

  // Custom validators
  futureDateValidator() {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.value) {
        return null; // Let required validator handle empty values
      }

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate > today ? { futureDate: true } : null;
    };
  }

  maxAmountValidator(max: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = parseFloat(control.value);
      return value > max ? { maxAmount: { max, actual: value } } : null;
    };
  }

  requireCardDetailsIfCreditCard(group: AbstractControl): ValidationErrors | null {
    const paymentMethod = group.get('paymentMethod')?.value;
    const cardNumber = group.get('cardNumber')?.value;
    const cardExpiry = group.get('cardExpiry')?.value;
    const cardCvv = group.get('cardCvv')?.value;

    if (paymentMethod === PaymentMethod.CREDIT_CARD) {
      if (!cardNumber || !cardExpiry || !cardCvv) {
        return { cardDetailsRequired: true };
      }
    }
    return null;
  }

  notFutureDateFilter(d: Date | null): boolean {
    if (!d) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d <= today;
  }
  //}
}
