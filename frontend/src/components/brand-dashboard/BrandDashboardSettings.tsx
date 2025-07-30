"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function BrandDashboardSettings() {
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<any>({
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscOrSwift: "",
    branch: "",
    accountType: "Savings",
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Edit modal state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBankAccounts() {
      setBankLoading(true);
      setBankError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        const res = await fetch(`${API_BASE_URL}/creator-bank-accounts`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });
        if (!res.ok) throw new Error('Failed to fetch bank accounts');
        const data = await res.json();
        setBankAccounts(data.data || []);
      } catch (err: any) {
        setBankError(err.message || 'Error fetching bank accounts');
      }
      setBankLoading(false);
    }
    fetchBankAccounts();
  }, []);

  const handleAddBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_BASE_URL}/creator-bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(addForm)
      });
      if (!res.ok) throw new Error('Failed to add bank account');
      const data = await res.json();
      setBankAccounts((prev) => [...prev, data.data]);
      setShowAddForm(false);
      setAddForm({
        accountHolderName: "",
        bankName: "",
        accountNumber: "",
        ifscOrSwift: "",
        branch: "",
        accountType: "Savings",
      });
    } catch (err: any) {
      setAddError(err.message || 'Error adding bank account');
    }
    setAddLoading(false);
  };

  // Edit handlers
  const openEditModal = (acc: any) => {
    setEditForm({ ...acc });
    setShowEditForm(true);
    setEditError(null);
  };
  const handleEditBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_BASE_URL}/creator-bank-accounts/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update bank account');
      const data = await res.json();
      setBankAccounts((prev) => prev.map((b) => (b._id === editForm._id ? data.data : b)));
      setShowEditForm(false);
      setEditForm(null);
    } catch (err: any) {
      setEditError(err.message || 'Error updating bank account');
    }
    setEditLoading(false);
  };

  // Delete handlers
  const openDeleteConfirm = (accId: string) => {
    setDeleteAccountId(accId);
    setShowDeleteConfirm(true);
    setDeleteError(null);
  };
  const handleDeleteBankAccount = async () => {
    if (!deleteAccountId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const res = await fetch(`${API_BASE_URL}/creator-bank-accounts/${deleteAccountId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Failed to delete bank account');
      setBankAccounts((prev) => prev.filter((b) => b._id !== deleteAccountId));
      setShowDeleteConfirm(false);
      setDeleteAccountId(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting bank account');
    }
    setDeleteLoading(false);
  };

  return (
    <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm mt-8 ml-0">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Bank Accounts</h2>
        <button
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium shadow transition"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-5 h-5" /> Add Bank Account
        </button>
      </div>
      {bankLoading ? (
        <div className="text-gray-500 py-8">Loading bank accounts...</div>
      ) : bankError ? (
        <div className="text-red-500 py-8">{bankError}</div>
      ) : bankAccounts.length === 0 ? (
        <div className="flex flex-col py-16 text-gray-400">
          <svg width="80" height="80" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#F3F4F6"/><path d="M7 10V8a5 5 0 0 1 10 0v2" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="10" width="18" height="10" rx="2" stroke="#A78BFA" strokeWidth="1.5"/><path d="M7 15h.01M12 15h.01M17 15h.01" stroke="#A78BFA" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <div className="mt-4 text-lg">No bank accounts added yet.</div>
          <div className="text-sm text-gray-500">Add your first bank account to receive payments.</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {bankAccounts.map((acc, idx) => (
            <div key={acc._id || idx} className="bg-gray-50 p-6 rounded-xl border flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
              <div className="space-y-1">
                <div><span className="font-semibold text-gray-700">Account Holder:</span> <span className="text-gray-900">{acc.accountHolderName}</span></div>
                <div><span className="font-semibold text-gray-700">Bank:</span> <span className="text-gray-900">{acc.bankName}</span></div>
                <div><span className="font-semibold text-gray-700">Account Number:</span> <span className="text-gray-900">****{acc.accountNumber?.slice(-4)}</span></div>
                <div><span className="font-semibold text-gray-700">IFSC/SWIFT:</span> <span className="text-gray-900">{acc.ifscOrSwift}</span></div>
                <div><span className="font-semibold text-gray-700">Branch:</span> <span className="text-gray-900">{acc.branch}</span></div>
                <div><span className="font-semibold text-gray-700">Type:</span> <span className="text-gray-900">{acc.accountType}</span></div>
              </div>
              <div className="flex gap-3 mt-4 md:mt-0 md:ml-6">
                <button className="p-2 rounded hover:bg-purple-100 text-purple-600" title="Edit" onClick={() => openEditModal(acc)}><Edit2 className="w-5 h-5" /></button>
                <button className="p-2 rounded hover:bg-red-100 text-red-500" title="Delete" onClick={() => openDeleteConfirm(acc._id)}><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add Bank Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowAddForm(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Add Bank Account</h3>
            <form onSubmit={handleAddBankAccount} className="space-y-3">
              <input
                className="border rounded px-3 py-2 w-full"
                value={addForm.accountHolderName}
                onChange={e => setAddForm({ ...addForm, accountHolderName: e.target.value })}
                placeholder="Account Holder Name"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={addForm.bankName}
                onChange={e => setAddForm({ ...addForm, bankName: e.target.value })}
                placeholder="Bank Name"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={addForm.accountNumber}
                onChange={e => setAddForm({ ...addForm, accountNumber: e.target.value })}
                placeholder="Account Number"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={addForm.ifscOrSwift}
                onChange={e => setAddForm({ ...addForm, ifscOrSwift: e.target.value })}
                placeholder="IFSC/SWIFT"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={addForm.branch}
                onChange={e => setAddForm({ ...addForm, branch: e.target.value })}
                placeholder="Branch"
                required
              />
              <select
                className="border rounded px-3 py-2 w-full"
                value={addForm.accountType}
                onChange={e => setAddForm({ ...addForm, accountType: e.target.value })}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Other">Other</option>
              </select>
              {addError && <div className="text-red-500 text-xs">{addError}</div>}
              <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition" disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Account'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Edit Bank Account Modal */}
      {showEditForm && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowEditForm(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Edit Bank Account</h3>
            <form onSubmit={handleEditBankAccount} className="space-y-3">
              <input
                className="border rounded px-3 py-2 w-full"
                value={editForm.accountHolderName}
                onChange={e => setEditForm({ ...editForm, accountHolderName: e.target.value })}
                placeholder="Account Holder Name"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={editForm.bankName}
                onChange={e => setEditForm({ ...editForm, bankName: e.target.value })}
                placeholder="Bank Name"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={editForm.accountNumber}
                onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })}
                placeholder="Account Number"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={editForm.ifscOrSwift}
                onChange={e => setEditForm({ ...editForm, ifscOrSwift: e.target.value })}
                placeholder="IFSC/SWIFT"
                required
              />
              <input
                className="border rounded px-3 py-2 w-full"
                value={editForm.branch}
                onChange={e => setEditForm({ ...editForm, branch: e.target.value })}
                placeholder="Branch"
                required
              />
              <select
                className="border rounded px-3 py-2 w-full"
                value={editForm.accountType}
                onChange={e => setEditForm({ ...editForm, accountType: e.target.value })}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Other">Other</option>
              </select>
              {editError && <div className="text-red-500 text-xs">{editError}</div>}
              <button type="submit" className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition" disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowDeleteConfirm(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-semibold mb-4">Delete Bank Account</h3>
            <p className="mb-6">Are you sure you want to delete this bank account? This action cannot be undone.</p>
            {deleteError && <div className="text-red-500 text-xs mb-2">{deleteError}</div>}
            <div className="flex gap-3">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition w-full"
                onClick={handleDeleteBankAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg font-medium w-full"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 