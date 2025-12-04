import React, { useState, useEffect } from 'react';
import { getAppData, addTicket, updateTicket } from '../services/storageService';
import { AppData, Ticket, TicketStatus, TicketPriority } from '../types';
import { Plus, Search, Clock, AlertTriangle, CheckCircle, MoreHorizontal, User, Smartphone, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);
const generateTicketNumber = (existingTickets: Ticket[]) => {
  const count = existingTickets.length + 1001; // Simple increment
  return `T-${count}`;
};

const ServiceDesk: React.FC = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactNumber: '',
    deviceType: '',
    deviceModel: '',
    issueDescription: '',
    priority: 'MEDIUM' as TicketPriority,
    status: 'OPEN' as TicketStatus,
    notes: '',
    estimatedCost: 0,
    diagnosis: ''
  });

  useEffect(() => {
    setData(getAppData());
  }, []);

  const resetForm = () => {
    setFormData({
      customerName: '',
      contactNumber: '',
      deviceType: '',
      deviceModel: '',
      issueDescription: '',
      priority: 'MEDIUM',
      status: 'OPEN',
      notes: '',
      estimatedCost: 0,
      diagnosis: ''
    });
    setEditingTicket(null);
  };

  const handleOpenModal = (ticket?: Ticket) => {
    if (ticket) {
      setEditingTicket(ticket);
      setFormData({
        customerName: ticket.customerName,
        contactNumber: ticket.contactNumber,
        deviceType: ticket.deviceType,
        deviceModel: ticket.deviceModel,
        issueDescription: ticket.issueDescription,
        priority: ticket.priority,
        status: ticket.status,
        notes: ticket.notes || '',
        estimatedCost: ticket.estimatedCost || 0,
        diagnosis: ticket.diagnosis || ''
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    if (editingTicket) {
      // Update
      const updated: Ticket = {
        ...editingTicket,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      updateTicket(updated);
    } else {
      // Create
      const newTicket: Ticket = {
        id: generateId(),
        ticketNumber: generateTicketNumber(data.tickets),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      addTicket(newTicket);
    }

    setData(getAppData());
    setIsModalOpen(false);
    resetForm();
  };

  if (!data) return <div>Loading...</div>;

  const filteredTickets = data.tickets.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.deviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: { status: TicketStatus; label: string; color: string }[] = [
    { status: 'OPEN', label: 'Open / Queue', color: 'border-l-4 border-slate-400' },
    { status: 'IN_PROGRESS', label: 'In Progress', color: 'border-l-4 border-blue-500' },
    { status: 'WAITING_FOR_PARTS', label: 'Waiting for Parts', color: 'border-l-4 border-amber-500' },
    { status: 'RESOLVED', label: 'Resolved', color: 'border-l-4 border-emerald-500' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Service Desk</h2>
          <p className="text-slate-500">Manage repair tickets and technician tasks.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" /> New Ticket
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="flex gap-6 min-w-[1000px] h-full pb-4">
          {columns.map(col => {
            const tickets = filteredTickets.filter(t => t.status === col.status);
            return (
              <div key={col.status} className="flex-1 min-w-[280px] bg-slate-100 rounded-xl flex flex-col">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">{col.label}</h3>
                  <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
                    {tickets.length}
                  </span>
                </div>
                <div className="p-3 space-y-3 overflow-y-auto flex-1 max-h-[calc(100vh-250px)]">
                  {tickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      onClick={() => handleOpenModal(ticket)}
                      className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow ${col.color}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono font-bold text-slate-500">{ticket.ticketNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                          ${ticket.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            ticket.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            ticket.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-600'}
                        `}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 mb-1">{ticket.customerName}</h4>
                      <div className="flex items-center text-sm text-slate-600 mb-2">
                        <Smartphone size={14} className="mr-1" /> {ticket.deviceType}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 italic border-t border-slate-50 pt-2">
                        "{ticket.issueDescription}"
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {tickets.length === 0 && (
                     <div className="text-center py-8 text-slate-400 text-sm">No tickets</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="text-xl font-bold text-slate-800">
                {editingTicket ? `Edit Ticket ${editingTicket.ticketNumber}` : 'Create New Ticket'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600 text-sm uppercase">Customer Info</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      value={formData.customerName}
                      onChange={e => setFormData({...formData, customerName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                    <input 
                      required
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      value={formData.contactNumber}
                      onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                    />
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600 text-sm uppercase">Device Info</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Device Type</label>
                    <input 
                      required
                      placeholder="e.g. Laptop, Printer"
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      value={formData.deviceType}
                      onChange={e => setFormData({...formData, deviceType: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Device Model</label>
                    <input 
                      required
                      placeholder="e.g. HP Pavilion, Epson L120"
                      type="text" 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                      value={formData.deviceModel}
                      onChange={e => setFormData({...formData, deviceModel: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Issue & Status */}
              <div className="space-y-4 mb-6">
                <h4 className="font-semibold text-blue-600 text-sm uppercase">Ticket Details</h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Issue Description</label>
                  <textarea 
                    required
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={formData.issueDescription}
                    onChange={e => setFormData({...formData, issueDescription: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                      value={formData.priority}
                      onChange={e => setFormData({...formData, priority: e.target.value as TicketPriority})}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="CRITICAL">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-white"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as TicketStatus})}
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tech Notes (Only for editing or if needed) */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                <h4 className="font-semibold text-slate-700 text-sm flex items-center">
                   Technician Only
                </h4>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis / Actions Taken</label>
                  <textarea 
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="Technical details about the fix..."
                    value={formData.diagnosis}
                    onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                  <input 
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Cost (₱)</label>
                  <input 
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={formData.estimatedCost}
                    onChange={e => setFormData({...formData, estimatedCost: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-slate-300 text-slate-600 font-bold rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md"
                >
                  {editingTicket ? 'Save Changes' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDesk;