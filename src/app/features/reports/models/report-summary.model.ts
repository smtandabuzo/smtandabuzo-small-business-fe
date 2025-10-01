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
