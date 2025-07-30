import React, { useState } from 'react';
import { CreditCard, User, Bell, Shield, CheckCircle, Plus, Trash2, Pencil } from 'lucide-react';
import { loadRazorpayScript, openRazorpay, verifyUpiWithRazorpay } from '@/utils/razorpay';

interface BankAccount {
  _id?: string;
  id?: number;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscOrSwift: string;
  branch: string;
  accountType: string;
  isDefault: boolean;
}

interface AccountSettingsProps {
  bankAccounts: BankAccount[];
  onAddBankAccount: (accountData: {
    accountHolderName: string;
    bankName: string;
    accountNumber: string;
    ifscOrSwift: string;
    branch: string;
    accountType: string;
    document: File | null;
    isDefault: boolean;
  }) => void;
  onDeleteBankAccount: (id: string) => void;
  onEditBankAccount: (account: BankAccount) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ bankAccounts, onAddBankAccount, onDeleteBankAccount, onEditBankAccount }) => {
  const [activeTab, setActiveTab] = useState<'payment' | 'profile' | 'notifications' | 'security'>('payment');
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [accountData, setAccountData] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscOrSwift: '',
    branch: '',
    accountType: '',
    document: null as File | null,
    isDefault: false
  });
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiData, setUpiData] = useState({
    name: '',
    upiId: '',
    isDefault: false
  });
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteAccountId, setDeleteAccountId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBankAccount({
      accountHolderName: accountData.accountHolderName,
      bankName: accountData.bankName,
      accountNumber: accountData.accountNumber,
      ifscOrSwift: accountData.ifscOrSwift,
      branch: accountData.branch,
      accountType: accountData.accountType,
      document: accountData.document,
      isDefault: accountData.isDefault
    });
    setAccountData({
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscOrSwift: '',
      branch: '',
      accountType: '',
      document: null,
      isDefault: false
    });
    setShowAddAccount(false);
  };

  const handleUpiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only pass the required fields for the bank account type, or update the prop type if you want to support UPI accounts as well.
    // For now, just pass an empty object or show an alert (since the prop type is for bank accounts only).
    alert('UPI account addition is not supported in the current form.');
    setShowUpiForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Settings</h3>
        
        <div className="flex flex-col sm:flex-row border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'payment'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CreditCard className="w-4 h-4 inline-block mr-2" />
            Payment Methods
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <User className="w-4 h-4 inline-block mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'notifications'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="w-4 h-4 inline-block mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'security'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Security
          </button>
        </div>
        
        {activeTab === 'payment' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-base font-medium text-gray-900">Bank Accounts</h4>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-800 border border-green-200 bg-green-50 px-3 py-1 rounded-md"
                  type="button"
                  onClick={() => setShowUpiForm((prev) => !prev)}
                >
                  <span role="img" aria-label="UPI" className="mr-1">💸</span>
                  Verify with UPI
                </button>
                <button
                  onClick={() => setShowAddAccount(!showAddAccount)}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Account
                </button>
              </div>
            </div>
            
            {showAddAccount && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-3">Add New Payment Method</h5>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="account-holder-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Holder Name
                      </label>
                      <input
                        id="account-holder-name"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.accountHolderName}
                        onChange={(e) => setAccountData({ ...accountData, accountHolderName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="bank-name" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        id="bank-name"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.bankName}
                        onChange={(e) => setAccountData({ ...accountData, bankName: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-number" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        id="account-number"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.accountNumber}
                        onChange={(e) => setAccountData({ ...accountData, accountNumber: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="ifsc-or-swift" className="block text-sm font-medium text-gray-700 mb-1">
                        IFSC / SWIFT Code
                      </label>
                      <input
                        id="ifsc-or-swift"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.ifscOrSwift}
                        onChange={(e) => setAccountData({ ...accountData, ifscOrSwift: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Branch
                      </label>
                      <input
                        id="branch"
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.branch}
                        onChange={(e) => setAccountData({ ...accountData, branch: e.target.value })}
                      />
                    </div>
                    <div>
                      <label htmlFor="account-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Account Type
                      </label>
                      <select
                        id="account-type"
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={accountData.accountType}
                        onChange={(e) => setAccountData({ ...accountData, accountType: e.target.value })}
                      >
                        <option value="">Select type</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                        Supporting Document <span className="text-gray-400">(optional)</span>
                      </label>
                      <input
                        id="document"
                        type="file"
                        accept="image/*,application/pdf"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => setAccountData({ ...accountData, document: e.target.files ? e.target.files[0] : null })}
                      />
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <input
                      id="default-account"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={accountData.isDefault}
                      onChange={(e) => setAccountData({ ...accountData, isDefault: e.target.checked })}
                    />
                    <label htmlFor="default-account" className="ml-2 text-sm text-gray-700">
                      Set as default payment account
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => setShowAddAccount(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Add Account
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {showUpiForm && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h5 className="text-sm font-medium text-green-900 mb-3">Verify with UPI</h5>
                <form onSubmit={handleUpiSubmit}>
                  <div className="mb-3">
                    <label htmlFor="upi-name" className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input
                      id="upi-name"
                      type="text"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={upiData.name}
                      onChange={e => setUpiData({ ...upiData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="upi-id-main" className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
                    <input
                      id="upi-id-main"
                      type="text"
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      value={upiData.upiId}
                      onChange={e => setUpiData({ ...upiData, upiId: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center mb-3">
                    <input
                      id="upi-default"
                      type="checkbox"
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      checked={upiData.isDefault}
                      onChange={e => setUpiData({ ...upiData, isDefault: e.target.checked })}
                    />
                    <label htmlFor="upi-default" className="ml-2 text-sm text-gray-700">
                      Set as default payment account
                    </label>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      onClick={() => setShowUpiForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Add UPI
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={() => verifyUpiWithRazorpay(
                        upiData,
                        (response) => alert('UPI Verified! Payment ID: ' + response.razorpay_payment_id),
                        (error) => alert(typeof error === 'string' ? error : 'Verification failed')
                      )}
                    >
                      Verify with Razorpay
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {editingAccount && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                  <h3 className="text-lg font-semibold mb-4">Edit Bank Account</h3>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      onEditBankAccount(editingAccount);
                      setEditingAccount(null);
                    }}
                    className="space-y-4"
                  >
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.accountHolderName}
                      onChange={e => setEditingAccount({ ...editingAccount, accountHolderName: e.target.value })}
                      placeholder="Account Holder Name"
                      required
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.bankName}
                      onChange={e => setEditingAccount({ ...editingAccount, bankName: e.target.value })}
                      placeholder="Bank Name"
                      required
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.accountNumber}
                      onChange={e => setEditingAccount({ ...editingAccount, accountNumber: e.target.value })}
                      placeholder="Account Number"
                      required
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.ifscOrSwift}
                      onChange={e => setEditingAccount({ ...editingAccount, ifscOrSwift: e.target.value })}
                      placeholder="IFSC / SWIFT Code"
                      required
                    />
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.branch}
                      onChange={e => setEditingAccount({ ...editingAccount, branch: e.target.value })}
                      placeholder="Bank Branch"
                      required
                    />
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={editingAccount.accountType}
                      onChange={e => setEditingAccount({ ...editingAccount, accountType: e.target.value })}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        type="button"
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        onClick={() => setEditingAccount(null)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
            {bankAccounts.length > 0 ? (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div
                    key={account._id || account.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 rounded-full p-2 mr-3">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-900">{account.accountHolderName}</span>
                          {account.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {account.bankName} • ****{account.accountNumber ? account.accountNumber.slice(-4) : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <button
                        className="text-gray-400 hover:text-blue-600 ml-2"
                        onClick={() => setEditingAccount(account)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => {
                          const id = account._id ? String(account._id) : account.id !== undefined ? String(account.id) : '';
                          if (id) {
                            setDeleteAccountId(id);
                            setShowDeleteConfirm(true);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-2">No bank accounts added yet</p>
                <button
                  onClick={() => setShowAddAccount(true)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Add your first bank account
                </button>
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
                  <div className="flex gap-3">
                    <button
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition w-full"
                      onClick={() => {
                        if (deleteAccountId) onDeleteBankAccount(deleteAccountId);
                        setShowDeleteConfirm(false);
                        setDeleteAccountId(null);
                      }}
                    >
                      Delete
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
        )}
        
        {activeTab === 'profile' && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Profile settings coming soon</p>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Notification settings coming soon</p>
          </div>
        )}
        
        {activeTab === 'security' && (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Security settings coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings; 