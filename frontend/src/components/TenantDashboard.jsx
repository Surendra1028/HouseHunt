import React, { useState, useEffect } from 'react';
import { Home, FileText, Wrench, CreditCard, DollarSign, Calendar, Clock, ArrowUpRight, HelpCircle, Heart, Star, Bell, User, Edit3, MessageSquare, Search, Menu, X } from 'lucide-react';
import Chat from './Chat';

import { API_URL } from '../config';

export default function TenantDashboard({ token, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lease, setLease] = useState(null);
  const [properties, setProperties] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profName, setProfName] = useState(user.name || '');
  const [profPhone, setProfPhone] = useState(user.phone || '');
  const [profBio, setProfBio] = useState(user.bio || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Property Details modal State
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  
  // Book Visit Modal State
  const [showBookModal, setShowBookModal] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [visitMessage, setVisitMessage] = useState('');

  // Rent Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paying, setPaying] = useState(false);

  // Maintenance Request Form State
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [maintError, setMaintError] = useState('');
  const [chatContact, setChatContact] = useState(null);
  const [txnRef, setTxnRef] = useState('');
  const [maintSuccess, setMaintSuccess] = useState('');

  // Search Filter States
  const [searchLoc, setSearchLoc] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchMinPrice, setSearchMinPrice] = useState('');
  const [searchMaxPrice, setSearchMaxPrice] = useState('');
  const [searchBeds, setSearchBeds] = useState('');
  const [searchBaths, setSearchBaths] = useState('');
  const [searchAmenity, setSearchAmenity] = useState(''); // e.g. WiFi, Parking, Gym

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Lease
      const leaseRes = await fetch(`${API_URL}/leases/my-lease`, { headers });
      if (leaseRes.ok) {
        const leaseData = await leaseRes.json();
        setLease(leaseData);
      } else {
        setLease(null);
      }

      // 2. Invoices
      const invoicesRes = await fetch(`${API_URL}/invoices`, { headers });
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData);
      }

      // 3. Maintenance
      const maintenanceRes = await fetch(`${API_URL}/maintenance`, { headers });
      if (maintenanceRes.ok) {
        const maintData = await maintenanceRes.json();
        setMaintenance(maintData);
      }

      // 4. Bookings (visits)
      const bookingsRes = await fetch(`${API_URL}/bookings`, { headers });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }

      // 5. Favorites
      const favsRes = await fetch(`${API_URL}/properties/favorites`, { headers });
      if (favsRes.ok) {
        const favsData = await favsRes.json();
        setFavorites(favsData);
      }

      // 6. Notifications
      const notifsRes = await fetch(`${API_URL}/notifications`, { headers });
      if (notifsRes.ok) {
        const notifsData = await notifsRes.json();
        setNotifications(notifsData);
      }

      // 7. Search Properties
      await searchPropertiesList();

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchPropertiesList = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = `${API_URL}/properties`;
      const queryParams = [];
      if (searchLoc) queryParams.push(`location=${searchLoc}`);
      if (searchType) queryParams.push(`propertyType=${searchType}`);
      if (searchMinPrice) queryParams.push(`minPrice=${searchMinPrice}`);
      if (searchMaxPrice) queryParams.push(`maxPrice=${searchMaxPrice}`);
      if (searchBeds) queryParams.push(`beds=${searchBeds}`);
      if (searchBaths) queryParams.push(`baths=${searchBaths}`);
      if (searchAmenity) queryParams.push(`amenities=${searchAmenity}`);

      if (queryParams.length > 0) {
        url += `?${queryParams.join('&')}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (err) {
      console.error('Failed searching properties:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchPropertiesList();
  };

  // Toggle Favorite
  const handleToggleFavorite = async (propertyId, e) => {
    if (e) e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}/favorite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        // Refresh favs and property list
        const favsRes = await fetch(`${API_URL}/properties/favorites`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (favsRes.ok) {
          const favsData = await favsRes.json();
          setFavorites(favsData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Visit Booking
  const handleBookVisitSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: selectedProperty._id,
          visitDate,
          visitTime,
          message: visitMessage
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed booking visit');
      }

      setShowBookModal(false);
      setVisitDate('');
      setVisitTime('');
      setVisitMessage('');
      alert('House visit requested successfully!');
      fetchDashboardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Clear/Delete Booking History Item
  const handleClearBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to clear this booking request from your history?')) return;
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to clear booking');
      }
      fetchDashboardData();
    } catch (err) {
      alert(`Error clearing booking: ${err.message}`);
    }
  };

  // Generate and Download PDF Rent Payment Receipt
  const handleDownloadReceipt = (invoice) => {
    const tenantName = user.name || 'Tenant';
    const landlordName = lease?.property?.owner?.name || 'Landlord';
    const landlordPhone = lease?.property?.owner?.phone || '-';
    const landlordEmail = lease?.property?.owner?.email || '-';
    const propertyTitle = invoice.property?.title || lease?.property?.title || 'Rental Property';
    const propertyAddress = invoice.property?.address || lease?.property?.address || '-';
    const rentAmount = invoice.amount;
    const paymentDate = invoice.paidAt ? new Date(invoice.paidAt).toLocaleDateString() : new Date().toLocaleDateString();
    const txnId = invoice.transactionId || 'N/A';
    const paymentMethodName = invoice.paymentMethod ? invoice.paymentMethod.toUpperCase() : 'UPI';
    const billingPeriod = invoice.dueDate ? `Rent for period ending ${new Date(invoice.dueDate).toLocaleDateString()}` : 'Monthly Rent';
    const receiptNo = `REC-${new Date(invoice.paidAt || Date.now()).getFullYear()}-${invoice._id.substring(18).toUpperCase()}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocker is enabled. Please allow popups to view/print receipt.');
      return;
    }

    const html = [
      '<html>',
      '  <head>',
      '    <title>Rent Receipt - ' + receiptNo + '</title>',
      '    <style>',
      '      body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; background-color: #ffffff; }',
      '      .receipt-container { max-width: 800px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }',
      '      .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }',
      '      .brand-title { font-size: 24px; font-weight: 800; color: #1e3a8a; letter-spacing: -0.5px; }',
      '      .receipt-badge { background-color: #10b981; color: white; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 14px; text-transform: uppercase; }',
      '      .meta-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }',
      '      .info-block h4 { margin: 0 0 8px 0; color: #4b5563; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }',
      '      .info-block p { margin: 0; font-size: 15px; font-weight: 600; }',
      '      .party-details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0; margin-bottom: 30px; }',
      '      .party-col h3 { margin: 0 0 10px 0; font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }',
      '      .party-col p { margin: 4px 0; font-size: 14px; }',
      '      .party-col strong { font-size: 16px; color: #111827; }',
      '      .financial-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }',
      '      .financial-table th { background-color: #f3f4f6; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #4b5563; border-bottom: 1px solid #e5e7eb; }',
      '      .financial-table td { padding: 16px 12px; font-size: 15px; border-bottom: 1px solid #e5e7eb; }',
      '      .total-row { font-size: 18px; font-weight: 800; color: #111827; background-color: #f9fafb; }',
      '      .total-row td { border-bottom: 2px double #e5e7eb; }',
      '      .footer-notes { text-align: center; font-size: 12px; color: #9ca3af; margin-top: 40px; border-top: 1px dashed #e5e7eb; padding-top: 20px; }',
      '      @media print { body { padding: 0; background-color: transparent; } .receipt-container { border: none; box-shadow: none; padding: 0; max-width: 100%; } }',
      '    </style>',
      '  </head>',
      '  <body>',
      '    <div class="receipt-container">',
      '      <div class="header-bar">',
      '        <div class="brand-title">HouseHunt Receipts</div>',
      '        <div class="receipt-badge">Paid</div>',
      '      </div>',
      '      <div class="meta-info-grid">',
      '        <div class="info-block">',
      '          <h4>Receipt Number</h4>',
      '          <p>' + receiptNo + '</p>',
      '        </div>',
      '        <div class="info-block" style="text-align: right;">',
      '          <h4>Payment Date</h4>',
      '          <p>' + paymentDate + '</p>',
      '        </div>',
      '        <div class="info-block">',
      '          <h4>Transaction ID</h4>',
      '          <p style="font-family: monospace;">' + txnId + '</p>',
      '        </div>',
      '        <div class="info-block" style="text-align: right;">',
      '          <h4>Payment Method</h4>',
      '          <p>' + paymentMethodName + '</p>',
      '        </div>',
      '      </div>',
      '      <div class="party-details">',
      '        <div class="party-col">',
      '          <h3>Tenant Info</h3>',
      '          <p><strong>' + tenantName + '</strong></p>',
      '          <p>Email: ' + user.email + '</p>',
      '        </div>',
      '        <div class="party-col">',
      '          <h3>Landlord Info</h3>',
      '          <p><strong>' + landlordName + '</strong></p>',
      '          <p>Email: ' + landlordEmail + '</p>',
      '          <p>Phone: ' + landlordPhone + '</p>',
      '        </div>',
      '      </div>',
      '      <table class="financial-table">',
      '        <thead>',
      '          <tr>',
      '            <th>Description</th>',
      '            <th>Billing Period</th>',
      '            <th style="text-align: right;">Amount</th>',
      '          </tr>',
      '        </thead>',
      '        <tbody>',
      '          <tr>',
      '            <td>',
      '              <strong>Rent Payment</strong><br>',
      '              <span style="font-size: 12px; color: #6b7280; font-weight: normal;">Property: ' + propertyTitle + '<br>Address: ' + propertyAddress + '</span>',
      '            </td>',
      '            <td>' + billingPeriod + '</td>',
      '            <td style="text-align: right; font-weight: 600; font-size: 15px;">$' + rentAmount + '.00</td>',
      '          </tr>',
      '          <tr class="total-row">',
      '            <td colspan="2">Total Rent Paid</td>',
      '            <td style="text-align: right; color: #10b981;">$' + rentAmount + '.00</td>',
      '          </tr>',
      '        </tbody>',
      '      </table>',
      '      <div class="footer-notes">',
      '        <p>Thank you for renting with HouseHunt! This is an electronically generated receipt; no physical signature is required.</p>',
      '        <p style="font-size: 10px; color: #d1d5db; margin-top: 10px;">Generated at ' + new Date().toLocaleString() + '</p>',
      '      </div>',
      '    </div>',
      '    <script>',
      '      window.onload = function() {',
      '        window.print();',
      '      };',
      '    </script>',
      '  </body>',
      '</html>'
    ].join('\n');

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    try {
      const response = await fetch(`${API_URL}/properties/${selectedProperty._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: reviewRating, reviewText })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to submit review');
      }

      const updatedProp = await response.json();
      setSelectedProperty(updatedProp); // update modal info
      setReviewText('');
      setReviewRating(5);
      // Refresh properties list
      searchPropertiesList();
    } catch (err) {
      alert(err.message);
    }
  };

  // Pay rent
  const handleSimulatePayment = async () => {
    if (!selectedInvoice) return;

    const isUpi = ['phonepe', 'gpay', 'paytm'].includes(paymentMethod);
    if (isUpi) {
      if (!lease?.property?.owner?.upiId) {
        alert('This landlord does not have a registered UPI ID. Please contact them or select a different payment gateway.');
        return;
      }
      if (!txnRef.trim()) {
        alert('Please enter the Transaction Reference ID from your UPI app.');
        return;
      }
    }

    setPaying(true);

    try {
      const response = await fetch(`${API_URL}/invoices/${selectedInvoice._id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          paymentMethod,
          transactionId: isUpi ? txnRef.trim() : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      fetchDashboardData();
      setShowPayModal(false);
      setSelectedInvoice(null);
      setTxnRef('');
      alert(`Payment successful! Transaction ID: ${data.invoice.transactionId}`);
    } catch (err) {
      alert(`Error processing payment: ${err.message}`);
    } finally {
      setPaying(false);
    }
  };

  // Save profile updates
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profName, phone: profPhone, bio: profBio })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Update failed');
      }

      // Update localStorage user details
      const userCached = JSON.parse(localStorage.getItem('user'));
      userCached.name = data.name;
      userCached.phone = data.phone;
      userCached.bio = data.bio;
      localStorage.setItem('user', JSON.stringify(userCached));

      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Maintenance Submit
  const handleMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setMaintError('');
    setMaintSuccess('');

    if (!lease) {
      setMaintError('You must have an active lease agreement to file a maintenance request');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/maintenance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          propertyId: lease.property._id,
          issue,
          description,
          priority
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Submission failed');
      }

      setMaintSuccess('Maintenance request submitted successfully!');
      setIssue('');
      setDescription('');
      setPriority('medium');
      fetchDashboardData();
    } catch (err) {
      setMaintError(err.message);
    }
  };

  // Calculations for Metrics
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
  const totalRentDue = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const activeRequests = maintenance.filter(m => m.status !== 'resolved');
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="app-container">
      {/* Sidebar Backdrop for mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">
            <Home size={20} />
          </div>
          <span className="logo-text">HouseHunt</span>
          <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
          >
            <Home className="menu-icon" /> Dashboard
          </li>
          <li 
            className={`menu-item ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => { setActiveTab('search'); setSidebarOpen(false); }}
          >
            <Search className="menu-icon" /> Search Houses
          </li>
          <li 
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
          >
            <Calendar className="menu-icon" /> Scheduled Visits
          </li>
          <li 
            className={`menu-item ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => { setActiveTab('favorites'); setSidebarOpen(false); }}
          >
            <Heart className="menu-icon" /> Favorites
          </li>
          <li 
            className={`menu-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }}
          >
            <FileText className="menu-icon" /> Invoices & Bills
          </li>
          <li 
            className={`menu-item ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => { setActiveTab('maintenance'); setSidebarOpen(false); }}
          >
            <Wrench className="menu-icon" /> Maintenance
          </li>
          <li 
            className={`menu-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notifications'); setSidebarOpen(false); }}
          >
            <Bell className="menu-icon" /> Notifications
            {unreadNotifications > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
                {unreadNotifications}
              </span>
            )}
          </li>
          <li 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => { setActiveTab('profile'); setSidebarOpen(false); }}
          >
            <User className="menu-icon" /> My Profile
          </li>
          <li 
            className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setSidebarOpen(false); }}
          >
            <MessageSquare className="menu-icon" /> Landlord Chat
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar">
              {profName ? profName.charAt(0).toUpperCase() : 'T'}
            </div>
            <div className="user-details">
              <div className="username">{profName}</div>
              <div className="user-role">Tenant</div>
            </div>
          </div>
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', fontSize: '0.85rem', padding: '0.6rem' }}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.reload();
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Portal</h2>
          </div>
        </div>

        <div className="content-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 style={{ color: 'var(--text-secondary)' }}>Syncing console data...</h2>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="animate-fade-in">
                  <div className="metrics-grid">
                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Rent Outstanding</span>
                        <div className="metric-icon-wrapper">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="metric-value">${totalRentDue}</div>
                      <span className="metric-desc">Across {pendingInvoices.length} pending bill(s)</span>
                    </div>

                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Lease Agreement</span>
                        <div className="metric-icon-wrapper" style={{ color: 'var(--color-success)' }}>
                          <Calendar size={20} />
                        </div>
                      </div>
                      <div className="metric-value" style={{ fontSize: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
                        {lease ? 'Active Contract' : 'No Active Lease'}
                      </div>
                      <span className="metric-desc">
                        {lease ? `Expires ${new Date(lease.endDate).toLocaleDateString()}` : 'Browse houses to secure a rental'}
                      </span>
                    </div>

                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Repair Requests</span>
                        <div className="metric-icon-wrapper" style={{ color: 'var(--color-warning)' }}>
                          <Wrench size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{activeRequests.length}</div>
                      <span className="metric-desc">Pending landlord response</span>
                    </div>
                  </div>

                  {/* Lease Details */}
                  {lease ? (
                    <div className="lease-overview-card glass animate-fade-in">
                      <div className="lease-info-block">
                        <h3>Contract Details</h3>
                        <div className="info-row"><span className="info-label">Address</span><span className="info-val">{lease.property.address}</span></div>
                        <div className="info-row"><span className="info-label">Monthly Rent</span><span className="info-val" style={{ color: 'var(--color-secondary)' }}>${lease.rentAmount}</span></div>
                        <div className="info-row"><span className="info-label">Commenced</span><span className="info-val">{new Date(lease.startDate).toLocaleDateString()}</span></div>
                        <div className="info-row"><span className="info-label">Terminates</span><span className="info-val">{new Date(lease.endDate).toLocaleDateString()}</span></div>
                      </div>
                      <div className="lease-info-block">
                        <h3>Landlord Details</h3>
                        <div className="info-row"><span className="info-label">Name</span><span className="info-val">{lease.property.owner.name}</span></div>
                        <div className="info-row"><span className="info-label">Email</span><span className="info-val">{lease.property.owner.email}</span></div>
                        <div className="info-row"><span className="info-label">Phone</span><span className="info-val">{lease.property.owner.phone || 'Not provided'}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="analytics-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                      <HelpCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                      <h3>No Leased Property Found</h3>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                        Browse our active properties directory, schedule house visits, and once you settle on a house, have the landlord register your lease.
                      </p>
                      <button className="btn btn-primary" onClick={() => setActiveTab('search')}>
                        Explore Available Homes
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SEARCH PROPERTIES */}
              {activeTab === 'search' && (
                <div className="animate-fade-in">
                  {/* Advanced Filters Form */}
                  <form onSubmit={handleSearchSubmit} className="analytics-card glass" style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Location</label>
                        <input type="text" className="form-input" placeholder="e.g. Springfield" value={searchLoc} onChange={(e) => setSearchLoc(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Property Type</label>
                        <select className="form-select" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
                          <option value="">All Types</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Min Price ($)</label>
                        <input type="number" className="form-input" placeholder="500" value={searchMinPrice} onChange={(e) => setSearchMinPrice(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Max Price ($)</label>
                        <input type="number" className="form-input" placeholder="3000" value={searchMaxPrice} onChange={(e) => setSearchMaxPrice(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Beds</label>
                        <input type="number" className="form-input" placeholder="2" value={searchBeds} onChange={(e) => setSearchBeds(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Baths</label>
                        <input type="number" className="form-input" placeholder="1" value={searchBaths} onChange={(e) => setSearchBaths(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Amenity</label>
                        <select className="form-select" value={searchAmenity} onChange={(e) => setSearchAmenity(e.target.value)}>
                          <option value="">Any</option>
                          <option value="WiFi">WiFi</option>
                          <option value="Parking">Parking</option>
                          <option value="Pool">Swimming Pool</option>
                          <option value="Gym">Fitness Gym</option>
                          <option value="AC">Air Conditioning</option>
                          <option value="Furnished">Furnished</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                      <Search size={16} /> Filter Properties
                    </button>
                  </form>

                  {/* Properties Results */}
                  {properties.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No properties match your filter selection.</p>
                  ) : (
                    <div className="properties-grid">
                      {properties.map(property => {
                        const isFav = favorites.some(f => f._id === property._id);
                        return (
                          <div key={property._id} className="property-card glass" onClick={() => setSelectedProperty(property)} style={{ cursor: 'pointer' }}>
                            <div className="property-image-wrapper">
                              <div className="property-img-placeholder">
                                <Home size={32} />
                                <span>{property.propertyType}</span>
                              </div>
                              <button 
                                className="property-status-badge badge" 
                                style={{ background: 'rgba(9, 13, 22, 0.6)', border: 'none', color: isFav ? 'var(--color-danger)' : '#fff', padding: '0.4rem', cursor: 'pointer' }}
                                onClick={(e) => handleToggleFavorite(property._id, e)}
                              >
                                <Heart size={16} fill={isFav ? 'var(--color-danger)' : 'none'} />
                              </button>
                            </div>
                            
                            <div className="property-content">
                              <div className="property-price">${property.rent}<span>/month</span></div>
                              <h3 className="property-title">{property.title}</h3>
                              <p className="property-address">{property.address}</p>
                              
                              <div className="property-features">
                                <span className="property-feature-item"><strong>{property.beds}</strong> Bed</span>
                                <span className="property-feature-item"><strong>{property.baths}</strong> Bath</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SCHEDULED VISITS */}
              {activeTab === 'bookings' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">House Visit Bookings History</h3>
                  </div>

                  {bookings.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No visits scheduled yet.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Property Listing</th>
                            <th>Landlord Name</th>
                            <th>Visit Date</th>
                            <th>Visit Time</th>
                            <th>Message</th>
                            <th>Booking Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookings.map(bk => (
                            <tr key={bk._id}>
                              <td style={{ fontWeight: 600 }}>{bk.property?.title}</td>
                              <td>{bk.property?.owner?.name || 'Unknown'}</td>
                              <td>{new Date(bk.visitDate).toLocaleDateString()}</td>
                              <td>{bk.visitTime}</td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px' }}>{bk.message || '-'}</td>
                              <td>
                                <span className={`badge ${
                                  bk.status === 'approved' ? 'badge-success' :
                                  bk.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                                }`}>
                                  {bk.status}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} 
                                  onClick={() => handleClearBooking(bk._id)}
                                >
                                  Clear
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: FAVORITES */}
              {activeTab === 'favorites' && (
                <div className="animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">My Saved Properties</h3>
                  </div>
                  {favorites.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No properties in your favorites list.</p>
                  ) : (
                    <div className="properties-grid">
                      {favorites.map(property => (
                        <div key={property._id} className="property-card glass" onClick={() => setSelectedProperty(property)} style={{ cursor: 'pointer' }}>
                          <div className="property-image-wrapper">
                            <div className="property-img-placeholder">
                              <Home size={32} />
                              <span>{property.propertyType}</span>
                            </div>
                            <button 
                              className="property-status-badge badge" 
                              style={{ background: 'rgba(9, 13, 22, 0.6)', border: 'none', color: 'var(--color-danger)', padding: '0.4rem', cursor: 'pointer' }}
                              onClick={(e) => handleToggleFavorite(property._id, e)}
                            >
                              <Heart size={16} fill="var(--color-danger)" />
                            </button>
                          </div>
                          <div className="property-content">
                            <div className="property-price">${property.rent}<span>/month</span></div>
                            <h3 className="property-title">{property.title}</h3>
                            <p className="property-address">{property.address}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BILLING & INVOICES */}
              {activeTab === 'billing' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Rental Invoices Ledger</h3>
                  </div>
                  {invoices.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No billing history found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Bill Item</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Transaction Hash</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map(invoice => (
                            <tr key={invoice._id}>
                              <td>{invoice.property?.title || 'Rent Bill'}</td>
                              <td style={{ fontWeight: 700 }}>${invoice.amount}</td>
                              <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${invoice.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{invoice.transactionId || '-'}</td>
                              <td>
                                {invoice.status === 'pending' ? (
                                  <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => setSelectedInvoice(invoice) || setShowPayModal(true)}>
                                    Pay Rent
                                  </button>
                                ) : (
                                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleDownloadReceipt(invoice)}>
                                    Receipt
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: MAINTENANCE */}
              {activeTab === 'maintenance' && (
                <div className="analytics-row animate-fade-in">
                  <div className="analytics-card glass">
                    <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>File Repair Request</h3>
                    {maintSuccess && <div className="badge badge-success" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', justifyContent: 'center' }}>{maintSuccess}</div>}
                    {maintError && <div className="badge badge-danger" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', justifyContent: 'center' }}>{maintError}</div>}
                    
                    <form onSubmit={handleMaintenanceSubmit}>
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <input type="text" className="form-input" placeholder="e.g. Broken water pipe" value={issue} onChange={(e) => setIssue(e.target.value)} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                          <option value="low">Low (Non-urgent)</option>
                          <option value="medium">Medium</option>
                          <option value="high">High (Urgent)</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" rows="4" placeholder="Explain the problem..." value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Request</button>
                    </form>
                  </div>

                  <div className="analytics-card glass">
                    <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Tickets History</h3>
                    <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                      {maintenance.map(req => (
                        <div key={req._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600 }}>{req.issue}</span>
                            <span className={`badge ${req.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>{req.status}</span>
                          </div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="analytics-card glass animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
                  <div className="card-header-bar">
                    <h3 className="card-title">Platform Notifications</h3>
                    {notifications.some(n => !n.isRead) && (
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={handleMarkAllNotificationsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="activity-list" style={{ marginTop: '1rem' }}>
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No notifications received.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className="activity-item" style={{ background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div className="activity-icon">
                            <Bell size={14} style={{ color: n.isRead ? 'var(--text-muted)' : 'var(--color-primary)' }} />
                          </div>
                          <div className="activity-info">
                            <div className="activity-text" style={{ fontWeight: n.isRead ? 400 : 700 }}>{n.title}</div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{n.message}</p>
                            <div className="activity-time" style={{ marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: PROFILE */}
              {activeTab === 'profile' && (
                <div className="analytics-card glass animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Edit Personal Profile</h3>
                  {profileSuccess && <div className="badge badge-success" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', justifyContent: 'center' }}>{profileSuccess}</div>}
                  
                  <form onSubmit={handleProfileUpdateSubmit}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input type="text" className="form-input" value={profName} onChange={(e) => setProfName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input type="text" className="form-input" value={profPhone} onChange={(e) => setProfPhone(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">About Me (Bio)</label>
                      <textarea className="form-textarea" rows="4" value={profBio} onChange={(e) => setProfBio(e.target.value)} placeholder="Type a short biography..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Updates</button>
                  </form>

                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Session Settings</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Log out of your active CozyRent session on this device.</p>
                    <button 
                      className="btn btn-danger" 
                      style={{ width: '100%' }}
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.reload();
                      }}
                    >
                      Log Out Account
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 9: CHAT */}
              {activeTab === 'chat' && (
                <Chat token={token} currentUser={user} initialContact={chatContact} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3>{selectedProperty.title}</h3>
              <button className="modal-close-btn" onClick={() => setSelectedProperty(null)}>✕</button>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
                <strong style={{ color: 'var(--color-secondary)', fontSize: '1.25rem' }}>${selectedProperty.rent}/month</strong>
                <span className="badge badge-info">{selectedProperty.propertyType}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>{selectedProperty.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                <div>
                  <strong>Address:</strong> {selectedProperty.address}
                </div>
                <div>
                  <strong>Configuration:</strong> {selectedProperty.beds} Beds, {selectedProperty.baths} Baths
                </div>
              </div>

              {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <strong>Amenities:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {selectedProperty.amenities.map((a, i) => (
                      <span key={i} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>{a}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Landlord Contact Info */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                <strong>Landlord Contact Details</strong>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span>Name: {selectedProperty.owner?.name}</span>
                  <span>Email: {selectedProperty.owner?.email}</span>
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }} onClick={() => setShowBookModal(true)}>
                    Book House Visit
                  </button>
                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', flex: 1 }} onClick={() => { setChatContact(selectedProperty.owner); setActiveTab('chat'); setSelectedProperty(null); }}>
                    Message Landlord
                  </button>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews Section */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h4>Ratings & Reviews</h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', marginTop: '0.5rem', paddingRight: '0.5rem' }}>
                {selectedProperty.reviews && selectedProperty.reviews.length > 0 ? (
                  selectedProperty.reviews.map(rv => (
                    <div key={rv._id} style={{ background: 'rgba(255,255,255,0.01)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                        <span>{rv.name}</span>
                        <span style={{ color: 'var(--color-warning)', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                          <Star size={12} fill="var(--color-warning)" /> {rv.rating}/5
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{rv.reviewText}</p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No reviews posted yet.</p>
                )}
              </div>

              {/* Leave Review Form */}
              <form onSubmit={handleReviewSubmit} style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>My Rating:</label>
                  <select className="form-select" style={{ width: '80px', padding: '0.25rem' }} value={reviewRating} onChange={(e) => setReviewRating(e.target.value)}>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <input type="text" className="form-input" placeholder="Write property review feedback..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Post Review</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Book Visit Modal */}
      {showBookModal && selectedProperty && (
        <div className="modal-overlay" style={{ zIndex: 105 }}>
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Book Visit: {selectedProperty.title}</h3>
              <button className="modal-close-btn" onClick={() => setShowBookModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleBookVisitSubmit}>
              <div className="form-group">
                <label className="form-label">Preferred Date</label>
                <input type="date" className="form-input" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Time Slot</label>
                <input type="text" className="form-input" placeholder="e.g. 10:30 AM or Evening" value={visitTime} onChange={(e) => setVisitTime(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Optional Message</label>
                <textarea className="form-textarea" rows="3" placeholder="Enter inquiry message details for the landlord..." value={visitMessage} onChange={(e) => setVisitMessage(e.target.value)}></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowBookModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rent Payment Modal */}
      {showPayModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Pay Rental Bill</h3>
              <button className="modal-close-btn" onClick={() => setShowPayModal(false) || setSelectedInvoice(null) || setTxnRef('')}>✕</button>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice amount due:</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-success)' }}>${selectedInvoice.amount}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Gateway</label>
              <select className="form-select" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="credit_card">Credit/Debit Card (Simulated)</option>
                <option value="phonepe">PhonePe UPI (Landlord UPI)</option>
                <option value="gpay">Google Pay (GPay) UPI (Landlord UPI)</option>
                <option value="paytm">Paytm UPI (Landlord UPI)</option>
                <option value="paypal">PayPal Sandbox (Simulated)</option>
                <option value="bank_transfer">Direct Bank ACH (Simulated)</option>
              </select>
            </div>

            {['phonepe', 'gpay', 'paytm'].includes(paymentMethod) && (
              <div style={{ padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem', background: 'rgba(255,255,255,0.02)' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                  {paymentMethod} Direct Transfer
                </h4>
                
                {lease?.property?.owner?.upiId ? (
                  <>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      Please open your mobile payment app and transfer <strong>${selectedInvoice.amount}</strong> to the Landlord's UPI address:
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px dashed var(--border-color)', marginBottom: '0.8rem' }}>
                      <code style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-primary)' }}>{lease.property.owner.upiId}</code>
                      <button 
                        type="button" 
                        className="btn" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'var(--border-color)' }}
                        onClick={() => {
                          navigator.clipboard.writeText(lease.property.owner.upiId);
                          alert('UPI ID copied to clipboard!');
                        }}
                      >
                        Copy
                      </button>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Transaction Reference ID / UTR (Required)</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={txnRef} 
                        onChange={(e) => setTxnRef(e.target.value)} 
                        placeholder="Enter 12-digit transaction number" 
                        style={{ fontSize: '0.85rem' }}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-danger)', padding: '0.5rem' }}>
                    ⚠️ The landlord ({lease?.property?.owner?.name || 'Owner'}) has not registered a UPI ID for rent collection. Please contact them or select Credit/Debit Card to pay.
                  </div>
                )}
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(false) || setSelectedInvoice(null) || setTxnRef('')} disabled={paying}>Cancel</button>
              <button type="button" className="btn btn-success" onClick={handleSimulatePayment} disabled={paying}>
                {paying ? 'Processing...' : 'Confirm Rent Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
