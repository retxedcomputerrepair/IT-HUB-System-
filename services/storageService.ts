import { AppData, Product, Service, Transaction, Expense, User, Ticket } from '../types';

const STORAGE_KEY = 'it_service_hub_data_v1';

const SEED_DATA: AppData = {
  users: [
    { id: 'u1', username: 'admin', role: 'ADMIN', name: 'System Admin' },
    { id: 'u2', username: 'staff', role: 'STAFF', name: 'John Doe' },
  ],
  products: [
    { id: 'p1', name: 'Kingston 8GB DDR4 RAM', category: 'COMPUTER_PARTS', price: 1200, stock: 10 },
    { id: 'p2', name: 'Logitech Wireless Mouse', category: 'LAPTOP_ACCESSORIES', price: 550, stock: 25 },
    { id: 'p3', name: 'Epson L3110 Printhead', category: 'PRINTER_PARTS', price: 2500, stock: 3 },
    { id: 'p4', name: '1TB SSD Samsung', category: 'COMPUTER_PARTS', price: 3500, stock: 5 },
    { id: 'p5', name: 'USB-C Hub', category: 'LAPTOP_ACCESSORIES', price: 800, stock: 15 },
  ],
  services: [
    { id: 's1', name: 'Tarpaulin Printing', category: 'PRINTING', basePrice: 15, unit: 'per sq ft' },
    { id: 's2', name: 'Document Printing (B&W)', category: 'PRINTING', basePrice: 2, unit: 'per page' },
    { id: 's3', name: 'Document Printing (Color)', category: 'PRINTING', basePrice: 5, unit: 'per page' },
    { id: 's4', name: 'Mug Printing', category: 'PRINTING', basePrice: 150, unit: 'pc' },
    { id: 's5', name: 'T-Shirt Printing (Heat Press)', category: 'PRINTING', basePrice: 250, unit: 'pc' },
    { id: 's6', name: 'Laptop Reformat', category: 'REPAIR', basePrice: 500, unit: 'service' },
    { id: 's7', name: 'Printer Reset', category: 'REPAIR', basePrice: 300, unit: 'service' },
  ],
  transactions: [
    {
      id: 't1',
      date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
      customerName: 'Alice Smith',
      items: [{ id: 's1', name: 'Tarpaulin Printing', type: 'SERVICE', price: 300, quantity: 1, details: '4x5 ft' }],
      totalAmount: 300,
      amountPaid: 300,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      processedBy: 'u2',
    },
    {
      id: 't2',
      date: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
      customerName: 'Bob Jones',
      items: [{ id: 'p1', name: 'Kingston 8GB DDR4 RAM', type: 'PRODUCT', price: 1200, quantity: 2 }],
      totalAmount: 2400,
      amountPaid: 1000,
      paymentStatus: 'PARTIAL',
      paymentMethod: 'CASH',
      notes: 'Will pay balance next week',
      processedBy: 'u2',
    },
  ],
  expenses: [
    {
      id: 'e1',
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      category: 'Utilities',
      description: 'Internet Bill',
      amount: 1500,
      recordedBy: 'u1',
    },
    {
      id: 'e2',
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      category: 'Supplies',
      description: 'Ink Bottles (Black, Cyan)',
      amount: 1200,
      recordedBy: 'u1',
    },
  ],
  tickets: [
    {
      id: 'tk1',
      ticketNumber: 'T-1001',
      customerName: 'Sarah Connor',
      contactNumber: '0917-123-4567',
      deviceType: 'Laptop',
      deviceModel: 'Dell Inspiron 15',
      issueDescription: 'Blue screen loop upon startup.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      diagnosis: 'Suspected HDD failure.',
      estimatedCost: 3500
    },
    {
      id: 'tk2',
      ticketNumber: 'T-1002',
      customerName: 'Kyle Reese',
      contactNumber: '0918-987-6543',
      deviceType: 'Printer',
      deviceModel: 'Epson L360',
      issueDescription: 'Paper jam error even without paper.',
      status: 'OPEN',
      priority: 'MEDIUM',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    }
  ]
};

export const getAppData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  const parsedData = JSON.parse(data);
  // Ensure tickets array exists for older versions
  if (!parsedData.tickets) parsedData.tickets = SEED_DATA.tickets;
  return parsedData;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const addTransaction = (transaction: Transaction) => {
  const data = getAppData();
  data.transactions.unshift(transaction); // Add to beginning
  saveAppData(data);
};

export const addExpense = (expense: Expense) => {
  const data = getAppData();
  data.expenses.unshift(expense);
  saveAppData(data);
};

export const updateTransaction = (updatedTx: Transaction) => {
  const data = getAppData();
  const index = data.transactions.findIndex((t) => t.id === updatedTx.id);
  if (index !== -1) {
    data.transactions[index] = updatedTx;
    saveAppData(data);
  }
};

export const updateProductStock = (productId: string, quantityChange: number) => {
  const data = getAppData();
  const product = data.products.find(p => p.id === productId);
  if (product) {
    product.stock += quantityChange;
    saveAppData(data);
  }
};

export const addTicket = (ticket: Ticket) => {
  const data = getAppData();
  data.tickets.unshift(ticket);
  saveAppData(data);
};

export const updateTicket = (ticket: Ticket) => {
  const data = getAppData();
  const index = data.tickets.findIndex(t => t.id === ticket.id);
  if (index !== -1) {
    data.tickets[index] = ticket;
    saveAppData(data);
  }
};