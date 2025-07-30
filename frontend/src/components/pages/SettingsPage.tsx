"use client";

import { DashboardLayout } from "../layout/DashboardLayout";
import { Bell, Lock, Eye, Globe, CreditCard, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getPaymentHistory, getBrandVerificationStatus } from "@/services/api";
import { getCreatorVerificationStatus } from "@/services/creatorApi";
import React from "react";
import { Dialog } from "@headlessui/react";
import { checkUserRoleAndId } from "@/api/api";
import API from "@/services/api";

interface NotificationSettings {
  emailNotifications: boolean;
  messageNotifications: boolean;
  profileViews: boolean;
  newFollowers: boolean;
}

interface PrivacySettings {
  profileVisibility: "public" | "private";
  showEmail: boolean;
  showLocation: boolean;
}

interface LanguageSettings {
  language: string;
  timezone: string;
}

interface BillingInfo {
  plan: string;
  cardNumber: string;
  expiryDate: string;
}

// Add this helper to fetch order details
async function fetchOrderDetails(orderId: string) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch order details');
    return await response.json();
  } catch (error) {
    return null;
  }
}

// Payment Details Modal
function PaymentDetailsModal({ payment, open, onClose }: { payment: any, open: boolean, onClose: () => void }) {
  const [orderDetails, setOrderDetails] = useState<any>(null);
  useEffect(() => {
    if (open && payment && payment.order) {
      fetchOrderDetails(payment.order).then((orderRes) => {
        if (orderRes && orderRes.data) setOrderDetails(orderRes.data);
        else setOrderDetails(null);
      });
    } else {
      setOrderDetails(null);
    }
  }, [open, payment]);

  if (!payment) return null;
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen">
        {/* Modal background overlay */}
        <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
        <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
          <Dialog.Title className="text-lg font-bold mb-4">Payment Details</Dialog.Title>
          <div className="space-y-2">
            <div><b>Order Date:</b> {orderDetails && orderDetails.createdAt ? new Date(orderDetails.createdAt).toLocaleString() : '-'}</div>
            <div><b>Payment Date:</b> {payment.createdAt ? new Date(payment.createdAt).toLocaleString() : '-'}</div>
            <div><b>Amount:</b> {payment.amount ? `₹${payment.amount}` : '-'}</div>
            <div><b>Status:</b> {payment.status || payment.paymentStatus || '-'}</div>
            <div><b>Method:</b> {payment.paymentMethod || '-'}</div>
            <div><b>Transaction ID:</b> {payment.transactionId || payment._id || '-'}</div>
            <div><b>Order ID:</b> {payment.order || '-'}</div>
            <div><b>Details:</b> <pre className="whitespace-pre-wrap">{JSON.stringify(payment.paymentDetails, null, 2)}</pre></div>
          </div>
          <button onClick={onClose} className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 w-full">Close</button>
        </div>
      </div>
    </Dialog>
  );
}

export const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    messageNotifications: true,
    profileViews: false,
    newFollowers: true,
  });

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: "public",
    showEmail: false,
    showLocation: true,
  });

  const [language, setLanguage] = useState<LanguageSettings>({
    language: "English",
    timezone: "UTC+5:30",
  });

  const [billing, setBilling] = useState<BillingInfo>({
    plan: "Professional",
    cardNumber: "**** **** **** 4242",
    expiryDate: "12/24",
  });

  // Payment history state
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [brandVerification, setBrandVerification] = useState<any>(null);

  // Add state for bank accounts (for billing section)
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  // Add state for editing bank accounts
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Placeholder: Replace with real user type check
  const isBrand = true; // TODO: Replace with real check

  // Account tab state
  const [accountUsername, setAccountUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [accountFullName, setAccountFullName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [accountGoOfflineFor, setAccountGoOfflineFor] = useState("");
  const [accountDeactivationReason, setAccountDeactivationReason] = useState("");
  const accountDeactivationReasons = [
    "I found a better platform",
    "I have privacy concerns",
    "I don't need the service anymore",
    "Other",
  ];

  const [saveStatus, setSaveStatus] = useState<null | 'success' | 'error'>(null);
  const [saveMessage, setSaveMessage] = useState("");

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [deviceSessions, setDeviceSessions] = useState<any[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState("");

  const [passwordStatus, setPasswordStatus] = useState<null | 'success' | 'error'>(null);
  const [passwordMessage, setPasswordMessage] = useState("");

  // Billing tab state
  const [billingVerification, setBillingVerification] = useState<any>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      setAccountLoading(true);
      setAccountError("");
      try {
        const res = await checkUserRoleAndId();
        if (res && res.userData) {
          setAccountUsername(res.userData.username || res.userData.userName || "");
          setOriginalUsername(res.userData.username || res.userData.userName || "");
          setAccountFullName(res.userData.fullName || res.userData.name || "");
          setAccountEmail(res.userData.email || "");
        } else {
          setAccountError("Could not load user data");
        }
      } catch (e) {
        setAccountError("Error loading user data");
      }
      setAccountLoading(false);
    }
    fetchUser();
  }, []);

  // Mock username availability check
  const checkUsernameAvailability = async (username: string) => {
    setCheckingUsername(true);
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    // Mock: usernames 'admin' and 'test' are taken
    if (["admin", "test"].includes(username.toLowerCase())) {
      setUsernameAvailable(false);
    } else {
      setUsernameAvailable(true);
    }
    setCheckingUsername(false);
  };

  const handleUsernameBlur = () => {
    if (accountUsername && accountUsername !== originalUsername) {
      checkUsernameAvailability(accountUsername);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setSaveMessage("");
    try {
      await API.put("/users/profile", { fullName: accountFullName });
      setSaveStatus("success");
      setSaveMessage("Name updated successfully!");
    } catch (error: any) {
      setSaveStatus("error");
      setSaveMessage(error?.response?.data?.message || "Failed to update name.");
    }
  };

  useEffect(() => {
    if (activeTab === "billing") {
      setPaymentLoading(true);
      getPaymentHistory().then((res) => {
        if (res && res.success !== false && Array.isArray(res)) {
          setPaymentHistory(res);
          setPaymentError(null);
        } else if (res && Array.isArray(res.data)) {
          setPaymentHistory(res.data);
          setPaymentError(null);
        } else if (res && Array.isArray(res.payments)) {
          setPaymentHistory(res.payments);
          setPaymentError(null);
        } else if (res && Array.isArray(res.history)) {
          setPaymentHistory(res.history);
          setPaymentError(null);
        } else if (res && Array.isArray(res.result)) {
          setPaymentHistory(res.result);
          setPaymentError(null);
        } else {
          setPaymentHistory([]);
          setPaymentError(res?.error || "No payment history found.");
        }
        setPaymentLoading(false);
      }).catch((err) => {
        setPaymentError(err?.message || "Failed to fetch payment history");
        setPaymentLoading(false);
      });
      // Fetch brand payment verification data if brand
      if (isBrand) {
        getBrandVerificationStatus().then((res) => {
          console.log("Brand verification status response:", res);
          if (res && res.success === true && 'data' in res && res.data) {
            setBrandVerification(res.data.payment);
          } else {
            setBrandVerification(null);
          }
        });
      }
      // Only fetch for creators
      const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
      if (userRole === 'creator') {
        setBillingLoading(true);
        setBillingError("");
        getCreatorVerificationStatus()
          .then(res => setBillingVerification(res.verification))
          .catch(() => setBillingError("Failed to load payment verification."))
          .finally(() => setBillingLoading(false));
      } else {
        setBillingVerification(null);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "billing") {
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
    }
  }, [activeTab]);

  // Fetch device sessions when Security tab is active
  useEffect(() => {
    if (activeTab === "security") {
      setDevicesLoading(true);
      setDevicesError("");
      API.get("/users/devices")
        .then(res => setDeviceSessions(res.data))
        .catch(err => setDevicesError("Failed to load devices."))
        .finally(() => setDevicesLoading(false));
    }
  }, [activeTab]);

  const handleSignOutDevice = async (sessionId: string) => {
    try {
      await API.delete(`/users/devices/${sessionId}`);
      setDeviceSessions(sessions => sessions.filter(s => s._id !== sessionId));
    } catch {
      alert("Failed to sign out device.");
    }
  };

  const tabs = [
    {
      id: "account",
      label: "Account",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: "security",
      label: "Security",
      icon: <Lock className="w-5 h-5" />,
    },
    {
      id: "billing",
      label: "Billing",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      id: "help",
      label: "Help & Support",
      icon: <HelpCircle className="w-5 h-5" />,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return (
          <div className="max-w-lg mx-auto bg-white p-4 rounded shadow-sm">
            <h1 className="text-lg font-semibold mb-4 text-center">
              Need to update your public profile? <a href="/profile" className="text-blue-600 hover:underline">Go to My Profile</a>
            </h1>
            {accountLoading ? (
              <div className="text-center text-gray-400 py-8">Loading...</div>
            ) : accountError ? (
              <div className="text-center text-red-500 py-8">{accountError}</div>
            ) : (
            <form className="mb-4" onSubmit={handleSave}>
              <label className="block font-semibold mb-1 text-xs text-purple-600">USERNAME</label>
              <input
                type="text"
                className={`w-full border rounded px-2 py-1 mb-1 text-sm focus:border-purple-500 focus:ring-purple-500 bg-gray-100 text-gray-500`}
                value={accountUsername}
                disabled
              />
              <label className="block font-semibold mb-1 text-xs">FULL NAME</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                value={accountFullName}
                onChange={e => setAccountFullName(e.target.value)}
              />
              <label className="block font-semibold mb-1 text-xs">EMAIL</label>
              <input
                type="text"
                className="w-full border rounded px-2 py-1 mb-2 bg-gray-100 text-gray-500 text-sm"
                value={accountEmail}
                readOnly
              />
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 text-sm mt-2 disabled:opacity-50"
                disabled={accountLoading || !accountFullName}
              >
                Save Changes
              </button>
              {saveStatus === "success" && <div className="text-green-600 text-xs mt-2">{saveMessage}</div>}
              {saveStatus === "error" && <div className="text-red-600 text-xs mt-2">{saveMessage}</div>}
            </form>
            )}
            {/* Email Verification Modal */}
            <Dialog open={showVerifyModal} onClose={() => setShowVerifyModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true" />
                <div className="bg-white rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
                  <Dialog.Title className="text-lg font-bold mb-4">Verify Your Email</Dialog.Title>
                  <div className="mb-4">To change your username, please verify your email. We've sent a verification link to <b>{accountEmail}</b>.</div>
                  <button
                    className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 text-sm w-full"
                    onClick={() => { setShowVerifyModal(false); setOriginalUsername(accountUsername); alert('Email verified (mock). Username updated!'); }}
                  >
                    I have verified my email
                  </button>
                  <button
                    className="mt-2 w-full text-xs text-gray-500 hover:underline"
                    onClick={() => setShowVerifyModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Dialog>
            <hr className="my-4" />
            <div>
              <div className="font-semibold mb-1 text-xs">ACCOUNT DEACTIVATION</div>
              <div className="flex flex-col md:flex-row md:items-start md:space-x-4">
                <div className="text-gray-700 mb-2 md:mb-0 md:w-1/2">
                  <div className="font-semibold mb-1 text-xs">What happens when you deactivate your account?</div>
                  <ul className="list-disc ml-4 text-xs">
                    <li>Your profile and Gigs won't be shown on the platform anymore.</li>
                    <li>Active orders will be cancelled.</li>
                    <li>You won't be able to re-activate your Gigs.</li>
                  </ul>
                </div>
                <div className="md:w-1/2">
                  <label className="block mb-1 text-xs">I'm leaving because...</label>
                  <select
                    className="w-full border rounded px-2 py-1 mb-2 text-xs"
                    value={accountDeactivationReason}
                    onChange={e => setAccountDeactivationReason(e.target.value)}
                  >
                    <option value="">Choose a reason</option>
                    {accountDeactivationReasons.map((reason, idx) => (
                      <option key={idx} value={reason}>{reason}</option>
                    ))}
                  </select>
                  <button
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 text-xs"
                    onClick={handleDeactivateAccount}
                    disabled={!accountDeactivationReason}
                  >
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "notifications":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Notification Settings
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Email Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Receive email updates about your account activity
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        emailNotifications: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Message Notifications
                  </h3>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive messages
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifications.messageNotifications}
                    onChange={(e) =>
                      setNotifications((prev) => ({
                        ...prev,
                        messageNotifications: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Privacy Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Profile Visibility
                </h3>
                <select
                  value={privacy.profileVisibility}
                  onChange={(e) =>
                    setPrivacy((prev) => ({
                      ...prev,
                      profileVisibility: e.target.value as "public" | "private",
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "visibility":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Visibility Settings
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Profile Discovery
                </h3>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <option>Everyone</option>
                  <option>Only Followers</option>
                  <option>Nobody</option>
                </select>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">
                  Search Listing
                </h3>
                <select className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                  <option>Listed</option>
                  <option>Unlisted</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Language & Region
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Language</h3>
                <select
                  value={language.language}
                  onChange={(e) =>
                    setLanguage((prev) => ({
                      ...prev,
                      language: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Chinese</option>
                </select>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Time Zone</h3>
                <select
                  value={language.timezone}
                  onChange={(e) =>
                    setLanguage((prev) => ({
                      ...prev,
                      timezone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <option>UTC+5:30 (India)</option>
                  <option>UTC+0 (London)</option>
                  <option>UTC-5 (New York)</option>
                  <option>UTC-8 (Los Angeles)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Billing & Subscription
            </h2>
            {/* Payment Method Section (Brand Only) */}
            {isBrand && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Payment Method Verification</h3>
                {/* UPI Verification */}
                <div className="p-4 bg-gray-50 rounded border mb-2 flex items-center justify-between">
                  <div>
                    <div><b>UPI:</b> {brandVerification?.upi?.upiId || '-'}</div>
                    <div><b>Status:</b> {brandVerification?.upi?.status === 'verified' ? 'Verified' : (brandVerification?.upi?.status || 'Not added')}</div>
                    {brandVerification?.upi?.verifiedAt && (
                      <div><b>Verified At:</b> {new Date(brandVerification.upi.verifiedAt).toLocaleString()}</div>
                    )}
                  </div>
                  {brandVerification?.upi?.status === 'verified' ? (
                    <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Edit</button>
                  ) : (
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Add/Verify</button>
                  )}
                </div>
                {/* Card Verification */}
                <div className="p-4 bg-gray-50 rounded border mb-2 flex items-center justify-between">
                  <div>
                    <div><b>Card:</b> {brandVerification?.card?.cardLast4 ? `**** **** **** ${brandVerification.card.cardLast4}` : '-'}</div>
                    <div><b>Status:</b> {brandVerification?.card?.status === 'verified' ? 'Verified' : (brandVerification?.card?.status || 'Not added')}</div>
                    {brandVerification?.card?.verifiedAt && (
                      <div><b>Verified At:</b> {new Date(brandVerification.card.verifiedAt).toLocaleString()}</div>
                    )}
                  </div>
                  {brandVerification?.card?.status === 'verified' ? (
                    <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700">Edit</button>
                  ) : (
                    <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Add/Verify</button>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-8">
              {/* Bank Accounts Section */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Bank Accounts</h3>
                {bankLoading ? (
                  <div className="text-gray-500">Loading bank accounts...</div>
                ) : bankError ? (
                  <div className="text-red-500">{bankError}</div>
                ) : bankAccounts.length === 0 ? (
                  <div className="text-gray-400">No bank accounts found.</div>
                ) : (
                  <div className="space-y-2">
                    {bankAccounts.map((acc, idx) => (
                      <div key={acc._id || idx} className="bg-gray-50 p-4 rounded-lg border flex flex-col md:flex-row md:items-center md:justify-between">
                        {editingAccount && editingAccount._id === acc._id ? (
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              setEditLoading(true);
                              setEditError(null);
                              try {
                                const token = localStorage.getItem('token');
                                const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
                                const res = await fetch(`${API_BASE_URL}/creator-bank-accounts/${acc._id}`, {
                                  method: 'PUT',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                                  },
                                  body: JSON.stringify(editForm)
                                });
                                if (!res.ok) throw new Error('Failed to update bank account');
                                // Refresh local state after edit
                                setEditingAccount(null);
                                setEditForm({});
                                setEditLoading(false);
                                setBankAccounts((prev) =>
                                  prev.map((b) => (b._id === acc._id ? { ...b, ...editForm } : b))
                                );
                              } catch (err: any) {
                                setEditError(err.message || 'Error updating bank account');
                                setEditLoading(false);
                              }
                            }}
                            className="w-full"
                          >
                            <div className="flex flex-col gap-2">
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.accountHolderName || acc.accountHolderName}
                                onChange={e => setEditForm({ ...editForm, accountHolderName: e.target.value })}
                                placeholder="Account Holder"
                              />
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.bankName || acc.bankName}
                                onChange={e => setEditForm({ ...editForm, bankName: e.target.value })}
                                placeholder="Bank Name"
                              />
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.accountNumber || acc.accountNumber}
                                onChange={e => setEditForm({ ...editForm, accountNumber: e.target.value })}
                                placeholder="Account Number"
                              />
                              <input
                                className="border rounded px-2 py-1"
                                value={editForm.ifscOrSwift || acc.ifscOrSwift}
                                onChange={e => setEditForm({ ...editForm, ifscOrSwift: e.target.value })}
                                placeholder="IFSC/SWIFT"
                              />
                              <select
                                className="border rounded px-2 py-1"
                                value={editForm.accountType || acc.accountType}
                                onChange={e => setEditForm({ ...editForm, accountType: e.target.value })}
                              >
                                <option value="">Choose Type</option>
                                <option value="Savings">Savings</option>
                                <option value="Current">Current</option>
                                {/* <option value="Salary">Salary</option>
                                <option value="NRE">NRE</option> */}
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            {editError && <div className="text-red-500 text-xs mt-1">{editError}</div>}
                            <div className="flex gap-2 mt-2">
                              <button type="submit" className="bg-purple-600 text-white px-3 py-1 rounded" disabled={editLoading}>
                                {editLoading ? 'Saving...' : 'Save'}
                              </button>
                              <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setEditingAccount(null)}>
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div>
                              <div><b>Account Holder:</b> {acc.accountHolderName}</div>
                              <div><b>Bank:</b> {acc.bankName}</div>
                              <div><b>Account Number:</b> ****{acc.accountNumber?.slice(-4)}</div>
                              <div><b>IFSC/SWIFT:</b> {acc.ifscOrSwift}</div>
                              <div><b>Type:</b> {acc.accountType}</div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {acc.isDefault && <span className="text-xs text-green-600 font-semibold mt-2 md:mt-0">Default</span>}
                              <button
                                className="text-xs text-blue-600 underline mt-2"
                                onClick={() => {
                                  setEditingAccount(acc);
                                  setEditForm(acc);
                                }}
                              >
                                Edit
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Card Payment Method UI */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Card Payment Method</h3>
                <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {billing.cardNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires {billing.expiryDate}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdateBilling()}
                    className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    Update
                  </button>
                </div>
              </div>
              {/* Billing History (existing code) */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Billing History
                </h3>
                <div className="space-y-2">
                  {paymentLoading ? (
                    <div className="text-gray-500">Loading payments...</div>
                  ) : paymentError ? (
                    <div className="text-red-500">{paymentError}</div>
                  ) : paymentHistory.length === 0 ? (
                    <div className="text-gray-400">No payments found.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {/* Only show one payment per order (latest by createdAt) */}
                          {Array.from(
                            new Map(
                              paymentHistory
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map(payment => [payment.order, payment])
                            ).values()
                          ).map((payment, idx) => (
                            <tr
                              key={payment._id || payment.id || idx}
                              className="cursor-pointer hover:bg-purple-50"
                              onClick={() => { setSelectedPayment(payment); setModalOpen(true); }}
                            >
                              <td className="px-4 py-2 whitespace-nowrap">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{payment.amount ? `₹${payment.amount}` : '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${payment.status === 'paid' || payment.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{payment.status || payment.paymentStatus || '-'}</span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">{payment.paymentMethod || '-'}</td>
                              <td className="px-4 py-2 whitespace-nowrap">{payment.transactionId || payment._id || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {/* Payment Details Modal */}
                <PaymentDetailsModal
                  payment={selectedPayment}
                  open={modalOpen}
                  onClose={() => setModalOpen(false)}
                />
              </div>
            </div>
          </div>
        );

      case "help":
        return (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Help & Support
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {[
                    "How do I change my password?",
                    "How do I delete my account?",
                    "How do I contact support?",
                  ].map((question, index) => (
                    <button
                      key={index}
                      className="w-full text-left p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Contact Support
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600 mb-4">
                    Need help? Our support team is available 24/7.
                  </p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="max-w-lg mx-auto bg-white p-4 rounded shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-center">Security Settings</h2>
            {/* Change Password */}
            <form className="mb-6" onSubmit={handleChangePassword}>
              <h3 className="text-sm font-semibold mb-2">Change Password</h3>
              <input
                type="password"
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                placeholder="Current Password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                placeholder="New Password"
                value={newPassword}
                onFocus={() => setShowPasswordRules(true)}
                onBlur={() => setShowPasswordRules(false)}
                onChange={e => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                className="w-full border rounded px-2 py-1 mb-2 text-sm"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {showPasswordRules && (
                <ul className="text-xs text-gray-500 mb-2 pl-4 list-disc">
                  <li>At least 8 characters</li>
                  <li>One uppercase, one lowercase, one number</li>
                  <li>One special character</li>
                </ul>
              )}
              {passwordStatus && (
                <div className={`mb-2 text-xs ${passwordStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{passwordMessage}</div>
              )}
              <button type="submit" className="bg-purple-600 text-white px-4 py-1 rounded hover:bg-purple-700 text-sm">Save Password</button>
            </form>
            {/* Connected Devices */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Connected Devices</h3>
              {devicesLoading ? (
                <div className="text-xs text-gray-500 mb-2">Loading devices...</div>
              ) : devicesError ? (
                <div className="text-xs text-red-500 mb-2">{devicesError}</div>
              ) : (
                <ul className="text-xs text-gray-600 mb-2">
                  {deviceSessions.map(device => (
                    <li key={device._id} className="flex items-center justify-between mb-1">
                      <span>
                        {device.browser} on {device.os} <span className="text-gray-400">({device.lastActive ? new Date(device.lastActive).toLocaleString() : "Unknown"})</span>
                        <span className="ml-2 text-gray-400">IP: {device.ip}</span>
                      </span>
                      <button
                        className="text-red-500 hover:underline text-xs"
                        onClick={() => handleSignOutDevice(device._id)}
                      >
                        Sign Out
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleUpdateBilling = () => {
    setBilling((prev) => ({
      ...prev,
      cardNumber: "**** **** **** 5555", // Example update
      expiryDate: "01/25",
    }));
  };

  const handleDeactivateAccount = async () => {
    try {
      await API.put('/users/deactivate', { reason: accountDeactivationReason });
      alert('Account deactivated. You will be logged out.');
      // Optionally, clear localStorage and redirect to login
      localStorage.clear();
      window.location.href = '/login';
    } catch (error) {
      alert('Failed to deactivate account.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    setPasswordMessage("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordMessage("New passwords do not match.");
      return;
    }
    try {
      await API.put("/users/profile", { password: newPassword, currentPassword });
      setPasswordStatus("success");
      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      setPasswordStatus("error");
      setPasswordMessage(error?.response?.data?.message || "Failed to update password.");
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full md:w-64 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-purple-50 text-purple-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
