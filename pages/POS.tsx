import React, { useState, useEffect } from 'react';
import { getAppData, addTransaction, updateProductStock } from '../services/storageService';
import { AppData, CartItem, Product, Service, PaymentStatus, PaymentMethod } from '../types';
import { Plus, Trash2, CreditCard, User, ShoppingCart, Search, Settings } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Since we can't install uuid, we'll use a simple generator function in utils or inline
// Small utility for ID generation if we don't want to add a package dependency, but let's assume simple unique ID for now.
const generateId = () => Math.random().toString(36).substr(2, 9);

const POS: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'SERVICES'>('PRODUCTS');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Checkout State
  const [customerName, setCustomerName] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState('');
  
  // Service Customization
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceDims, setServiceDims] = useState({ width: 0, height: 0, qty: 1, notes: '' });

  useEffect(() => {
    setData(getAppData());
  }, []);

  if (!data) return <div>Loading POS...</div>;

  const addToCartProduct = (product: Product) => {
    if (product.stock <= 0) {
      alert("Out of stock!");
      return;
    }
    const existing = cart.find(c => c.id === product.id && c.type === 'PRODUCT');
    if (existing) {
      if (existing.quantity >= product.stock) {
        alert("Not enough stock!");
        return;
      }
      setCart(cart.map(c => c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, {
        id: product.id,
        name: product.name,
        type: 'PRODUCT',
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const addServiceToCart = () => {
    if (!selectedService) return;
    
    let finalPrice = selectedService.basePrice;
    let details = serviceDims.notes;

    // Logic for specific units
    if (selectedService.unit?.includes('sq ft')) {
       const area = serviceDims.width * serviceDims.height;
       finalPrice = selectedService.basePrice * area;
       details = `${serviceDims.width}x${serviceDims.height} ft (${area} sq ft) - ${details}`;
    }

    setCart([...cart, {
      id: selectedService.id + generateId(), // Unique ID for each service instance
      name: selectedService.name,
      type: 'SERVICE',
      price: finalPrice,
      quantity: serviceDims.qty,
      details: details
    }]);
    
    // Reset
    setSelectedService(null);
    setServiceDims({ width: 0, height: 0, qty: 1, notes: '' });
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const paidVal = parseFloat(paymentAmount) || 0;
  const balance = totalAmount - paidVal;

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!customerName) return alert("Please enter customer name");

    let status: PaymentStatus = 'PAID';
    if (paidVal === 0) status = 'UNPAID';
    else if (paidVal < totalAmount) status = 'PARTIAL';

    const newTx = {
      id: generateId(),
      date: new Date().toISOString(),
      customerName,
      items: cart,
      totalAmount,
      amountPaid: paidVal,
      paymentStatus: status,
      paymentMethod,
      notes,
      processedBy: 'u2' // Mock current user
    };

    addTransaction(newTx);
    
    // Update stock
    cart.forEach(item => {
      if (item.type === 'PRODUCT') {
        updateProductStock(item.id, -item.quantity);
      }
    });

    // Reset
    setCart([]);
    setCustomerName('');
    setPaymentAmount('');
    setNotes('');
    alert("Transaction Successful!");
    setData(getAppData()); // Refresh
  };

  const filteredProducts = data.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredServices = data.services.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      {/* Left Side: Selection Area */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Search & Tabs */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex gap-2 mb-4">
            <button 
              onClick={() => setActiveTab('PRODUCTS')}
              className={`flex-1 py-2 font-medium rounded-lg transition-colors ${activeTab === 'PRODUCTS' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Products
            </button>
            <button 
              onClick={() => setActiveTab('SERVICES')}
              className={`flex-1 py-2 font-medium rounded-lg transition-colors ${activeTab === 'SERVICES' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Services
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeTab === 'PRODUCTS' ? (
              filteredProducts.map(product => (
                <button 
                  key={product.id}
                  onClick={() => addToCartProduct(product)}
                  disabled={product.stock === 0}
                  className={`p-4 rounded-xl border text-left transition-all ${product.stock === 0 ? 'opacity-50 bg-slate-100 cursor-not-allowed' : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-md'}`}
                >
                  <p className="font-semibold text-slate-800 line-clamp-2">{product.name}</p>
                  <div className="flex justify-between items-end mt-2">
                    <span className="text-blue-600 font-bold">₱{product.price}</span>
                    <span className="text-xs text-slate-500">{product.stock} in stock</span>
                  </div>
                </button>
              ))
            ) : (
              filteredServices.map(service => (
                <button 
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className="p-4 rounded-xl border bg-white border-slate-200 hover:border-blue-500 hover:shadow-md text-left"
                >
                  <p className="font-semibold text-slate-800 line-clamp-2">{service.name}</p>
                  <div className="mt-2 text-sm text-slate-500">
                    Base: <span className="text-blue-600 font-bold">₱{service.basePrice}</span> /{service.unit?.replace('per ', '')}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Side: Cart & Checkout */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <ShoppingCart className="mr-2" size={20} /> Current Order
          </h2>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-slate-400 mt-10">
              <p>Cart is empty</p>
              <p className="text-sm">Select items to start</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{item.name}</p>
                  {item.details && <p className="text-xs text-slate-500 italic">{item.details}</p>}
                  <p className="text-xs text-slate-500">
                    {item.quantity} x ₱{item.price.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold text-slate-800 mr-3">₱{(item.quantity * item.price).toFixed(2)}</span>
                  <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-slate-800">
              <span>Total</span>
              <span>₱{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Customer Name"
                className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-500 font-bold">₱</span>
              <input 
                type="number" 
                placeholder="Amount Paid (0 for Unpaid)"
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
              />
            </div>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
            >
              <option value="CASH">Cash</option>
              <option value="GCASH">GCash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
            
            {balance > 0 && customerName && (
              <div className="p-2 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200">
                Note: Balance of ₱{balance.toLocaleString()} will be recorded as collectible.
              </div>
            )}

            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Transaction
            </button>
          </div>
        </div>
      </div>

      {/* Service Modal Overlay */}
      {selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Configure {selectedService.name}</h3>
            
            <div className="space-y-4">
              {selectedService.unit?.includes('sq ft') && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Width (ft)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded-lg"
                      value={serviceDims.width || ''}
                      onChange={e => setServiceDims({...serviceDims, width: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Height (ft)</label>
                    <input 
                      type="number" 
                      className="w-full p-2 border rounded-lg"
                      value={serviceDims.height || ''}
                      onChange={e => setServiceDims({...serviceDims, height: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full p-2 border rounded-lg"
                  value={serviceDims.qty}
                  onChange={e => setServiceDims({...serviceDims, qty: parseInt(e.target.value) || 1})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Details / Notes</label>
                <textarea 
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="e.g. Glossy paper, specific design ID..."
                  value={serviceDims.notes}
                  onChange={e => setServiceDims({...serviceDims, notes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setSelectedService(null)}
                className="flex-1 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={addServiceToCart}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POS;