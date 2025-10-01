export interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber?: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  items?: InvoiceItem[];
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
