import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, Wrench, Plus, DollarSign, Calendar, Check, Play, Edit3, Trash2, ArrowUpRight, TrendingUp, MessageSquare, Bell, User, Clock, CheckCircle, XCircle, Menu, X } from 'lucide-react';
import Chat from './Chat';

import { API_URL } from '../config';

export default function LandlordDashboard({ token, user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [properties, setProperties] = useState([]);
  const [leases, setLeases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profName, setProfName] = useState(user.name || '');
  const [profPhone, setProfPhone] = useState(user.phone || '');
  const [profBio, setProfBio] = useState(user.bio || '');
  const [profUpi, setProfUpi] = useState(user.upiId || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Property Modal Form States
  const [showPropModal, setShowPropModal] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propAddress, setPropAddress] = useState('');
  const [propRent, setPropRent] = useState('');
  const [propBeds, setPropBeds] = useState('');
  const [propBaths, setPropBaths] = useState('');
  const [propType, setPropType] = useState('apartment');
  const [propAmenities, setPropAmenities] = useState([]); // Array of strings

  // Lease Modal Form States
  const [showLeaseModal, setShowLeaseModal] = useState(false);
  const [leaseTenantEmail, setLeaseTenantEmail] = useState('');
  const [leasePropId, setLeasePropId] = useState('');
  const [leaseRent, setLeaseRent] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');

  // Manual Invoice Modal Form States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invTenantId, setInvTenantId] = useState('');
  const [chatContact, setChatContact] = useState(null);
  const [invPropId, setInvPropId] = useState('');
  const [invAmount, setInvAmount] = useState('');
  const [invDue, setInvDue] = useState('');

  const fetchDashboardData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Properties
      const propRes = await fetch(`${API_URL}/properties`, { headers });
      if (propRes.ok) {
        const data = await propRes.json();
        setProperties(data);
      }

      // 2. Leases
      const leaseRes = await fetch(`${API_URL}/leases/landlord`, { headers });
      if (leaseRes.ok) {
        const data = await leaseRes.json();
        setLeases(data);
      }

      // 3. Invoices
      const invRes = await fetch(`${API_URL}/invoices`, { headers });
      if (invRes.ok) {
        const data = await invRes.json();
        setInvoices(data);
      }

      // 4. Maintenance
      const maintRes = await fetch(`${API_URL}/maintenance`, { headers });
      if (maintRes.ok) {
        const data = await maintRes.json();
        setMaintenance(data);
      }

      // 5. Bookings (Visits requested by tenants)
      const bookingsRes = await fetch(`${API_URL}/bookings`, { headers });
      if (bookingsRes.ok) {
        const data = await bookingsRes.json();
        setBookings(data);
      }

      // 6. Notifications
      const notifsRes = await fetch(`${API_URL}/notifications`, { headers });
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data);
      }

    } catch (err) {
      console.error('Error fetching landlord dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // CRUD Properties
  const handlePropSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: propTitle,
      description: propDesc,
      address: propAddress,
      rent: Number(propRent),
      beds: Number(propBeds),
      baths: Number(propBaths),
      propertyType: propType,
      amenities: propAmenities
    };

    const method = editingProp ? 'PUT' : 'POST';
    const endpoint = editingProp ? `/properties/${editingProp._id}` : '/properties';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save property');
      }

      setShowPropModal(false);
      resetPropForm();
      fetchDashboardData();
      alert('Listing submitted successfully! Note: New properties require Admin verification approval before going active.');
    } catch (err) {
      alert(`Error saving property: ${err.message}`);
    }
  };

  const handleEditPropClick = (property) => {
    setEditingProp(property);
    setPropTitle(property.title);
    setPropDesc(property.description || '');
    setPropAddress(property.address);
    setPropRent(property.rent);
    setPropBeds(property.beds);
    setPropBaths(property.baths);
    setPropType(property.propertyType || 'apartment');
    setPropAmenities(property.amenities || []);
    setShowPropModal(true);
  };

  const handleDeletePropClick = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property? This action is irreversible.')) return;
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete property');
      }
      fetchDashboardData();
    } catch (err) {
      alert(`Error deleting property: ${err.message}`);
    }
  };

  const resetPropForm = () => {
    setEditingProp(null);
    setPropTitle('');
    setPropDesc('');
    setPropAddress('');
    setPropRent('');
    setPropBeds('');
    setPropBaths('');
    setPropType('apartment');
    setPropAmenities([]);
  };

  // Toggle Amenity Checkbox
  const handleAmenityChange = (amenity) => {
    if (propAmenities.includes(amenity)) {
      setPropAmenities(propAmenities.filter(a => a !== amenity));
    } else {
      setPropAmenities([...propAmenities, amenity]);
    }
  };

  // Leases
  const handleLeaseSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tenantEmail: leaseTenantEmail,
      propertyId: leasePropId,
      rentAmount: Number(leaseRent),
      startDate: leaseStart,
      endDate: leaseEnd
    };

    try {
      const response = await fetch(`${API_URL}/leases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to register lease');
      }

      setShowLeaseModal(false);
      setLeaseTenantEmail('');
      setLeasePropId('');
      setLeaseRent('');
      setLeaseStart('');
      setLeaseEnd('');
      fetchDashboardData();
    } catch (err) {
      alert(`Error registering lease: ${err.message}`);
    }
  };

  const handleEndLease = async (leaseId) => {
    if (!window.confirm('Are you sure you want to end this lease? The property will be marked as available.')) return;
    try {
      const response = await fetch(`${API_URL}/leases/${leaseId}/end`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to terminate lease');
      }
      fetchDashboardData();
    } catch (err) {
      alert(`Error ending lease: ${err.message}`);
    }
  };

  // Invoices
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      tenantId: invTenantId,
      propertyId: invPropId,
      amount: Number(invAmount),
      dueDate: invDue
    };

    try {
      const response = await fetch(`${API_URL}/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to generate invoice');
      }

      setShowInvoiceModal(false);
      setInvTenantId('');
      setInvPropId('');
      setInvAmount('');
      setInvDue('');
      fetchDashboardData();
    } catch (err) {
      alert(`Error generating invoice: ${err.message}`);
    }
  };

  // Maintenance Actions
  const handleUpdateMaintStatus = async (reqId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/maintenance/${reqId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update request');
      }
      fetchDashboardData();
    } catch (err) {
      alert(`Error updating ticket status: ${err.message}`);
    }
  };

  // Booking Visit Request approvals
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Booking update failed');
      }
      fetchDashboardData();
    } catch (err) {
      alert(`Error updating booking: ${err.message}`);
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
        body: JSON.stringify({ name: profName, phone: profPhone, bio: profBio, upiId: profUpi })
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
      userCached.upiId = data.upiId;
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

  // Statistics Computations
  const totalProperties = properties.length;
  const rentedProperties = properties.filter(p => p.status === 'occupied').length;
  const activeMaint = maintenance.filter(m => m.status !== 'resolved').length;
  const totalEarnings = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const pendingVisits = bookings.filter(b => b.status === 'pending').length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Available properties for lease selector
  const availableProperties = properties.filter(p => p.status === 'available');
  const activeLeaseProperties = properties.filter(p => p.status === 'occupied');

  return (
    <div className="app-container">
      {/* Sidebar Backdrop for mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar Navigation */}
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
            <Home className="menu-icon" /> Overview
          </li>
          <li 
            className={`menu-item ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => { setActiveTab('properties'); setSidebarOpen(false); }}
          >
            <Home className="menu-icon" /> Properties
          </li>
          <li 
            className={`menu-item ${activeTab === 'leases' ? 'active' : ''}`}
            onClick={() => { setActiveTab('leases'); setSidebarOpen(false); }}
          >
            <Users className="menu-icon" /> Leases & Tenants
          </li>
          <li 
            className={`menu-item ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => { setActiveTab('billing'); setSidebarOpen(false); }}
          >
            <FileText className="menu-icon" /> Billings
          </li>
          <li 
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('bookings'); setSidebarOpen(false); }}
          >
            <Calendar className="menu-icon" /> Visit Requests
            {pendingVisits > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
                {pendingVisits}
              </span>
            )}
          </li>
          <li 
            className={`menu-item ${activeTab === 'maintenance' ? 'active' : ''}`}
            onClick={() => { setActiveTab('maintenance'); setSidebarOpen(false); }}
          >
            <Wrench className="menu-icon" /> Repairs
            {activeMaint > 0 && (
              <span className="badge badge-danger" style={{ marginLeft: 'auto', padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
                {activeMaint}
              </span>
            )}
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
            <MessageSquare className="menu-icon" /> Messages
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar">
              {profName ? profName.charAt(0).toUpperCase() : 'L'}
            </div>
            <div className="user-details">
              <div className="username">{profName}</div>
              <div className="user-role">Landlord</div>
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

      {/* Main Content Pane */}
      <div className="main-content">
        <div className="content-header">
          <button className="sidebar-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h2>Landlord Console</h2>
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
                        <span className="metric-title">Portfolio Size</span>
                        <div className="metric-icon-wrapper">
                          <Home size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{totalProperties}</div>
                      <span className="metric-desc">{rentedProperties} occupied properties</span>
                    </div>

                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Aggregate Revenue</span>
                        <div className="metric-icon-wrapper" style={{ color: 'var(--color-success)' }}>
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="metric-value">${totalEarnings}</div>
                      <span className="metric-desc">Lifetime collected rent</span>
                    </div>

                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Visit Inquiries</span>
                        <div className="metric-icon-wrapper" style={{ color: 'var(--color-secondary)' }}>
                          <Calendar size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{pendingVisits}</div>
                      <span className="metric-desc">Pending visit approvals</span>
                    </div>

                    <div className="metric-card glass">
                      <div className="metric-header">
                        <span className="metric-title">Pending Repairs</span>
                        <div className="metric-icon-wrapper" style={{ color: 'var(--color-warning)' }}>
                          <Wrench size={20} />
                        </div>
                      </div>
                      <div className="metric-value">{activeMaint}</div>
                      <span className="metric-desc">Leaseholder maintenance logs</span>
                    </div>
                  </div>

                  <div className="analytics-row">
                    <div className="analytics-card glass">
                      <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Upcoming Visit Requests</h3>
                      <div className="activity-list">
                        {bookings.slice(0, 4).length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent visit requests.</p>
                        ) : (
                          bookings.slice(0, 4).map(bk => (
                            <div key={bk._id} className="activity-item">
                              <div className="activity-icon">
                                <Calendar size={14} />
                              </div>
                              <div className="activity-info">
                                <div className="activity-text">
                                  <strong>{bk.tenant?.name}</strong> requested visit to <strong>{bk.property?.title}</strong>
                                </div>
                                <div className="activity-time">{new Date(bk.visitDate).toLocaleDateString()} at {bk.visitTime}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="analytics-card glass">
                      <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Maintenance Logs</h3>
                      <div className="activity-list">
                        {maintenance.slice(0, 4).length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recent maintenance tickets.</p>
                        ) : (
                          maintenance.slice(0, 4).map(req => (
                            <div key={req._id} className="activity-item">
                              <div className="activity-icon">
                                <Wrench size={14} />
                              </div>
                              <div className="activity-info">
                                <div className="activity-text">{req.issue}</div>
                                <span className={`badge ${req.status === 'resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', marginTop: '0.25rem' }}>
                                  {req.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PROPERTIES */}
              {activeTab === 'properties' && (
                <div className="animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Properties Manager</h3>
                    <button className="btn btn-primary" onClick={() => { resetPropForm(); setShowPropModal(true); }}>
                      <Plus size={16} /> Add Property
                    </button>
                  </div>

                  {properties.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                      No properties registered. Create one to begin.
                    </div>
                  ) : (
                    <div className="properties-grid">
                      {properties.map(property => (
                        <div key={property._id} className="property-card glass">
                          <div className="property-image-wrapper">
                            <div className="property-img-placeholder">
                              <Home size={32} />
                              <span>No Photo Uploaded</span>
                            </div>
                            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '0.25rem' }}>
                              <span className={`badge ${property.isApproved ? 'badge-success' : 'badge-warning'}`} style={{ opacity: 0.9 }}>
                                {property.isApproved ? 'Approved' : 'Pending Verification'}
                              </span>
                              <span className={`badge ${property.status === 'available' ? 'badge-success' : 'badge-danger'}`} style={{ opacity: 0.9 }}>
                                {property.status}
                              </span>
                            </div>
                          </div>

                          <div className="property-content">
                            <div className="property-price">${property.rent}<span>/month</span></div>
                            <h3 className="property-title">{property.title}</h3>
                            <p className="property-address">{property.address}</p>

                            <div className="property-features" style={{ justifyContent: 'space-between' }}>
                              <span className="property-feature-item"><strong>{property.beds}</strong> Bed</span>
                              <span className="property-feature-item"><strong>{property.baths}</strong> Bath</span>
                              <span className="property-feature-item" style={{ textTransform: 'capitalize' }}><strong>{property.propertyType}</strong></span>
                            </div>

                            <div className="property-actions">
                              <button className="btn btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem' }} onClick={() => handleEditPropClick(property)}>
                                <Edit3 size={14} /> Edit
                              </button>
                              <button className="btn btn-danger" style={{ padding: '0.5rem 0.8rem' }} onClick={() => handleDeletePropClick(property._id)} disabled={property.status === 'occupied'}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LEASES & TENANTS */}
              {activeTab === 'leases' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Tenant Leases Manager</h3>
                    <button className="btn btn-primary" onClick={() => setShowLeaseModal(true)}>
                      <Plus size={16} /> Register Lease
                    </button>
                  </div>

                  {leases.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No active lease registrations found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Tenant Name</th>
                            <th>Property Address</th>
                            <th>Rent Amount</th>
                            <th>Lease Duration</th>
                            <th>Contract Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leases.map(lease => (
                            <tr key={lease._id}>
                              <td style={{ fontWeight: 600 }}>
                                {lease.tenant?.name || 'Unknown'}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{lease.tenant?.email}</div>
                              </td>
                              <td>{lease.property?.address || 'Property Deleted'}</td>
                              <td style={{ fontWeight: 700 }}>${lease.rentAmount}/mo</td>
                              <td>{new Date(lease.startDate).toLocaleDateString()} - {new Date(lease.endDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${lease.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                                  {lease.status}
                                </span>
                              </td>
                              <td style={{ display: 'flex', gap: '0.5rem' }}>
                                {lease.status === 'active' ? (
                                  <>
                                    <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleEndLease(lease._id)}>
                                      Terminate
                                    </button>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => { setChatContact(lease.tenant); setActiveTab('chat'); }}>
                                      Message
                                    </button>
                                  </>
                                ) : 'Concluded'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: BILLING */}
              {activeTab === 'billing' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Invoices & Rent Ledger</h3>
                    <button className="btn btn-primary" onClick={() => leases.length === 0 ? alert('You must have active leases before generating manual invoices.') : setShowInvoiceModal(true)}>
                      <Plus size={16} /> Bill Invoice
                    </button>
                  </div>

                  {invoices.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No invoice logs generated.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Leaseholder</th>
                            <th>Property Address</th>
                            <th>Amount</th>
                            <th>Due Date</th>
                            <th>Payment Status</th>
                            <th>Simulated Method</th>
                            <th>Txn ID</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map(invoice => (
                            <tr key={invoice._id}>
                              <td style={{ fontWeight: 600 }}>{invoice.tenant?.name || 'Tenant'}</td>
                              <td>{invoice.property?.address || 'Address'}</td>
                              <td style={{ fontWeight: 700 }}>${invoice.amount}</td>
                              <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${invoice.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                                  {invoice.status}
                                </span>
                              </td>
                              <td>{invoice.paymentMethod || '-'}</td>
                              <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{invoice.transactionId || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: VISIT REQUESTS */}
              {activeTab === 'bookings' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">House Visit Booking Inquiries</h3>
                  </div>

                  {bookings.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No visit requests received.</p>
                  ) : (
                    <>
                      <div className="table-container bookings-table-container">
                        <table className="custom-table">
                          <thead>
                            <tr>
                              <th>Tenant Name</th>
                              <th>Property Listing</th>
                              <th>Visit Date</th>
                              <th>Visit Time</th>
                              <th>Inquiry Message</th>
                              <th>Status</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bookings.map(bk => (
                              <tr key={bk._id}>
                                <td style={{ fontWeight: 600 }}>
                                  {bk.tenant?.name}
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{bk.tenant?.phone}</div>
                                </td>
                                <td>{bk.property?.title}</td>
                                <td>{new Date(bk.visitDate).toLocaleDateString()}</td>
                                <td>{bk.visitTime}</td>
                                <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px' }}>{bk.message}</td>
                                <td>
                                  <span className={`badge ${
                                    bk.status === 'approved' ? 'badge-success' :
                                    bk.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                                  }`}>
                                    {bk.status}
                                  </span>
                                </td>
                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                  {bk.status === 'pending' ? (
                                    <>
                                      <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateBookingStatus(bk._id, 'approved')}>
                                        <CheckCircle size={12} /> Accept
                                      </button>
                                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateBookingStatus(bk._id, 'rejected')}>
                                        <XCircle size={12} /> Reject
                                      </button>
                                    </>
                                  ) : (
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => { setChatContact(bk.tenant); setActiveTab('chat'); }}>
                                      Message Tenant
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile View Card List */}
                      <div className="mobile-bookings-list">
                        {bookings.map(bk => (
                          <div key={bk._id} className="booking-mobile-card glass animate-fade-in">
                            <div className="booking-card-header">
                              <span className={`badge ${
                                bk.status === 'approved' ? 'badge-success' :
                                bk.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                              }`}>
                                {bk.status}
                              </span>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {bk.status === 'pending' ? (
                                  <>
                                    <button className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleUpdateBookingStatus(bk._id, 'approved')}>
                                      Accept
                                    </button>
                                    <button className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => handleUpdateBookingStatus(bk._id, 'rejected')}>
                                      Reject
                                    </button>
                                  </>
                                ) : (
                                  <button className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => { setChatContact(bk.tenant); setActiveTab('chat'); }}>
                                    Message
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="booking-card-body">
                              <div className="booking-info-row">
                                <span className="booking-info-label">Tenant Name</span>
                                <span className="booking-info-val" style={{ fontWeight: 600 }}>
                                  {bk.tenant?.name}
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{bk.tenant?.phone}</div>
                                </span>
                              </div>
                              <div className="booking-info-row">
                                <span className="booking-info-label">Property Listing</span>
                                <span className="booking-info-val">{bk.property?.title}</span>
                              </div>
                              <div className="booking-info-row">
                                <span className="booking-info-label">Visit Date</span>
                                <span className="booking-info-val">{new Date(bk.visitDate).toLocaleDateString()}</span>
                              </div>
                              <div className="booking-info-row">
                                <span className="booking-info-label">Visit Time</span>
                                <span className="booking-info-val">{bk.visitTime}</span>
                              </div>
                              {bk.message && (
                                <div className="booking-card-message">
                                  <strong>Inquiry Message:</strong>
                                  <p>{bk.message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* TAB 6: MAINTENANCE */}
              {activeTab === 'maintenance' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Maintenance Requests Ledger</h3>
                  </div>

                  {maintenance.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No repairs requested.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Property</th>
                            <th>Tenant Name</th>
                            <th>Issue Category</th>
                            <th>Details</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Timeline</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {maintenance.map(req => (
                            <tr key={req._id}>
                              <td>{req.property?.address}</td>
                              <td>{req.tenant?.name}</td>
                              <td style={{ fontWeight: 600 }}>{req.issue}</td>
                              <td style={{ maxWidth: '240px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{req.description}</td>
                              <td>
                                <span className={`badge ${req.priority === 'high' ? 'badge-danger' : req.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                  {req.priority}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${req.status === 'resolved' ? 'badge-success' : req.status === 'in-progress' ? 'badge-info' : 'badge-warning'}`}>
                                  {req.status}
                                </span>
                              </td>
                              <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                              <td>
                                {req.status === 'pending' && (
                                  <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateMaintStatus(req._id, 'in-progress')}>
                                    <Play size={12} /> Work
                                  </button>
                                )}
                                {req.status === 'in-progress' && (
                                  <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUpdateMaintStatus(req._id, 'resolved')}>
                                    <Check size={12} /> Resolve
                                  </button>
                                )}
                                {req.status === 'resolved' && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closed</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <div className="analytics-card glass animate-fade-in" style={{ maxWidth: '700px', margin: '0 auto' }}>
                  <div className="card-header-bar">
                    <h3 className="card-title">My Feed Notifications</h3>
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
                  <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>My Profile Details</h3>
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
                      <label className="form-label">UPI ID for Rent Collection (e.g. PhonePe/GPay/Paytm)</label>
                      <input type="text" className="form-input" value={profUpi} onChange={(e) => setProfUpi(e.target.value)} placeholder="landlord@upi" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">About Me (Bio)</label>
                      <textarea className="form-textarea" rows="4" value={profBio} onChange={(e) => setProfBio(e.target.value)} placeholder="Type a short landlord biography..."></textarea>
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

              {/* TAB 9: CHAT MESSAGES */}
              {activeTab === 'chat' && (
                <Chat token={token} currentUser={user} initialContact={chatContact} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Property CRUD Modal */}
      {showPropModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3>{editingProp ? 'Edit Property Details' : 'Add New Property Listing'}</h3>
              <button className="modal-close-btn" onClick={() => { setShowPropModal(false); resetPropForm(); }}>✕</button>
            </div>
            <form onSubmit={handlePropSubmit}>
              <div className="form-group">
                <label className="form-label">Property Title</label>
                <input type="text" className="form-input" placeholder="e.g. Spacious Penthouse Apartment" value={propTitle} onChange={(e) => setPropTitle(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-select" value={propType} onChange={(e) => setPropType(e.target.value)}>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Monthly Rent ($)</label>
                  <input type="number" className="form-input" value={propRent} onChange={(e) => setPropRent(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input type="text" className="form-input" placeholder="Address..." value={propAddress} onChange={(e) => setPropAddress(e.target.value)} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <input type="number" className="form-input" value={propBeds} onChange={(e) => setPropBeds(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input type="number" className="form-input" value={propBaths} onChange={(e) => setPropBaths(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Amenities</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {['WiFi', 'Parking', 'Pool', 'Gym', 'AC', 'Furnished'].map(amenity => (
                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={propAmenities.includes(amenity)} onChange={() => handleAmenityChange(amenity)} />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" rows="3" placeholder="Tell us more about the house..." value={propDesc} onChange={(e) => setPropDesc(e.target.value)}></textarea>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setShowPropModal(false); resetPropForm(); }}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProp ? 'Update Listing' : 'Submit Listing'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lease Creation Modal */}
      {showLeaseModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in">
            <div className="modal-header">
              <h3>Create Active Lease Agreement</h3>
              <button className="modal-close-btn" onClick={() => setShowLeaseModal(false)}>✕</button>
            </div>
            <form onSubmit={handleLeaseSubmit}>
              <div className="form-group">
                <label className="form-label">Tenant Email</label>
                <input type="email" className="form-input" placeholder="tenant@gmail.com" value={leaseTenantEmail} onChange={(e) => setLeaseTenantEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Property Selection</label>
                <select className="form-select" value={leasePropId} onChange={(e) => { setLeasePropId(e.target.value); const sel = properties.find(p => p._id === e.target.value); if (sel) setLeaseRent(sel.rent); }} required>
                  <option value="">-- Choose Available Property --</option>
                  {availableProperties.map(p => (
                    <option key={p._id} value={p._id}>{p.title} (${p.rent}/mo)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Monthly Rent Rate ($)</label>
                <input type="number" className="form-input" value={leaseRent} onChange={(e) => setLeaseRent(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={leaseStart} onChange={(e) => setLeaseStart(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={leaseEnd} onChange={(e) => setLeaseEnd(e.target.value)} required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeaseModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Lease</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content glass animate-fade-in">
            <div className="modal-header">
              <h3>Issue Rental Invoice</h3>
              <button className="modal-close-btn" onClick={() => setShowInvoiceModal(false)}>✕</button>
            </div>
            <form onSubmit={handleInvoiceSubmit}>
              <div className="form-group">
                <label className="form-label">Select Active Lease</label>
                <select className="form-select" onChange={(e) => { const lease = leases.find(l => l._id === e.target.value); if (lease) { setInvTenantId(lease.tenant._id); setInvPropId(lease.property._id); setInvAmount(lease.rentAmount); } }} required>
                  <option value="">-- Choose Active Agreement --</option>
                  {leases.filter(l => l.status === 'active').map(l => (
                    <option key={l._id} value={l._id}>{l.tenant?.name} - {l.property?.address} (${l.rentAmount})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Invoice Amount ($)</label>
                <input type="number" className="form-input" value={invAmount} onChange={(e) => setInvAmount(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Due Date</label>
                <input type="date" className="form-input" value={invDue} onChange={(e) => setInvDue(e.target.value)} required />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Issue Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
