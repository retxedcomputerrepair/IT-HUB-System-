export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export type TransactionType = 'SERVICE' | 'PRODUCT';
export type PaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL';
export type PaymentMethod = 'CASH' | 'GCASH' | 'BANK_TRANSFER' | 'CREDIT';

export interface CartItem {
  id: string;
  name: string;
  type: TransactionType;
  price: number;
  quantity: number;
  details?: string; // e.g., "3x4 ft" for Tarpaulin
}

export interface Transaction {
  id: string;
  date: string; // ISO string
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  processedBy: string; // User ID
}

export interface Product {
  id: string;
  name: string;
  category: 'COMPUTER_PARTS' | 'LAPTOP_ACCESSORIES' | 'PRINTER_PARTS' | 'OTHER';
  price: number;
  stock: number;
}

export interface Service {
  id: string;
  name: string;
  category: 'PRINTING' | 'REPAIR' | 'DESIGN' | 'OTHER';
  basePrice: number;
  unit?: string; // e.g., "per sq ft", "per page"
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  recordedBy: string;
}

// --- Service Desk Types ---
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_PARTS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. T-1001
  customerName: string;
  contactNumber: string;
  deviceType: string;
  deviceModel: string;
  issueDescription: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo?: string; // User ID
  createdAt: string;
  updatedAt: string;
  notes?: string; // Internal tech notes
  estimatedCost?: number;
  diagnosis?: string;
}

// Initial/Seed Data Types
export interface AppData {
  users: User[];
  products: Product[];
  services: Service[];
  transactions: Transaction[];
  expenses: Expense[];
  tickets: Ticket[];
}