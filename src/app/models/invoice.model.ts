export interface Invoice {
  id?: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInvoiceDto {
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
}
