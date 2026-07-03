import React, { useState, useEffect } from 'react';
import { Home, Users, FileText, Wrench, Plus, DollarSign, Calendar, Check, Trash2, ShieldAlert, AlertTriangle, ShieldCheck, Megaphone, MessageSquare, User } from 'lucide-react';
import Chat from './Chat';

import { API_URL } from '../config';

export default function AdminDashboard({ token, user, onUserUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Users Filter States
  const [searchUser, setSearchUser] = useState('');
  const [filterRole, setFilterRole] = useState('');

  // Property Filter States
  const [filterPropStatus, setFilterPropStatus] = useState('all'); // all, approved, pending

  // Broadcast Form States
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');

  // Profile Form States
  const [profName, setProfName] = useState(user?.name || '');
  const [profEmail, setProfEmail] = useState(user?.email || '');
  const [profPassword, setProfPassword] = useState('');
  const [profPhone, setProfPhone] = useState(user?.phone || '');
  const [profBio, setProfBio] = useState(user?.bio || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    if (user) {
      setProfName(user.name || '');
      setProfEmail(user.email || '');
      setProfPhone(user.phone || '');
      setProfBio(user.bio || '');
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Fetch Stats & Logs
      const statsRes = await fetch(`${API_URL}/admin/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Fetch Users
      let usersUrl = `${API_URL}/admin/users`;
      const queryParams = [];
      if (searchUser) queryParams.push(`search=${searchUser}`);
      if (filterRole) queryParams.push(`role=${filterRole}`);
      if (queryParams.length > 0) usersUrl += `?${queryParams.join('&')}`;

      const usersRes = await fetch(usersUrl, { headers });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      // 3. Fetch Properties
      const propsRes = await fetch(`${API_URL}/properties`, { headers });
      if (propsRes.ok) {
        const propsData = await propsRes.json();
        setPropertiesList(propsData);
      }

      // 4. Fetch Bookings
      const bookingsRes = await fetch(`${API_URL}/bookings`, { headers });
      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json();
        setBookingsList(bookingsData);
      }

    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchUser, filterRole]);

  // Block/Unblock User
  const handleToggleBlockUser = async (userId, isCurrentlyBlocked) => {
    const action = isCurrentlyBlocked ? 'reinstate' : 'suspend';
    if (!window.confirm(`Are you sure you want to ${action} this user's account?`)) return;

    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isBlocked: !isCurrentlyBlocked })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Action failed');
      }

      fetchAdminData();
    } catch (err) {
      alert(`Error toggling block state: ${err.message}`);
    }
  };

  // Approve/Unapprove Property
  const handleToggleApproveProp = async (propertyId, isCurrentlyApproved) => {
    try {
      const response = await fetch(`${API_URL}/admin/properties/${propertyId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isApproved: !isCurrentlyApproved })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Approval status update failed');
      }

      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Delete Property
  const handleDeleteProp = async (propertyId) => {
    if (!window.confirm('Are you sure you want to permanently delete this listing?')) return;
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Deletion failed');
      }

      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Publish Announcement
  const handlePublishBroadcast = async (e) => {
    e.preventDefault();
    setBroadcastSuccess('');

    try {
      const response = await fetch(`${API_URL}/admin/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: broadcastTitle, message: broadcastMessage })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Broadcast failed');
      }

      setBroadcastSuccess('Announcement broadcasted to all users!');
      setBroadcastTitle('');
      setBroadcastMessage('');
      fetchAdminData();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle Admin Profile & Password Update
  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: profName,
          email: profEmail,
          password: profPassword || undefined,
          phone: profPhone,
          bio: profBio
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Profile update failed');
      }

      // Update localStorage cached user
      const userCached = JSON.parse(localStorage.getItem('user'));
      userCached.name = data.name;
      userCached.email = data.email;
      userCached.phone = data.phone;
      userCached.bio = data.bio;
      localStorage.setItem('user', JSON.stringify(userCached));

      // Propagate update to App state
      if (typeof onUserUpdate === 'function') {
        onUserUpdate(userCached);
      }

      setProfileSuccess('Administrator profile updated successfully!');
      setProfPassword(''); // Clear password field
    } catch (err) {
      setProfileError(err.message);
    }
  };

  // Filter Properties List
  const filteredProperties = propertiesList.filter(prop => {
    if (filterPropStatus === 'approved') return prop.isApproved;
    if (filterPropStatus === 'pending') return !prop.isApproved;
    return true;
  });

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            <Home size={20} />
          </div>
          <span className="logo-text">HouseHunt</span>
        </div>

        <ul className="sidebar-menu">
          <li 
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Home className="menu-icon" /> Dashboard
          </li>
          <li 
            className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users className="menu-icon" /> Manage Users
          </li>
          <li 
            className={`menu-item ${activeTab === 'properties' ? 'active' : ''}`}
            onClick={() => setActiveTab('properties')}
          >
            <Home className="menu-icon" /> Listings Approval
          </li>
          <li 
            className={`menu-item ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <Calendar className="menu-icon" /> Managed Bookings
          </li>
          <li 
            className={`menu-item ${activeTab === 'broadcast' ? 'active' : ''}`}
            onClick={() => setActiveTab('broadcast')}
          >
            <Megaphone className="menu-icon" /> Announcements
          </li>
          <li 
            className={`menu-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquare className="menu-icon" /> System Chat
          </li>
          <li 
            className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User className="menu-icon" /> My Profile
          </li>
        </ul>

        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar">
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-details">
              <div className="username">{user.name}</div>
              <div className="user-role" style={{ color: 'var(--color-danger)' }}>Admin</div>
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
          <div className="header-title">
            <h2>Admin Console</h2>
          </div>
        </div>

        <div className="content-body">
          {loading && activeTab !== 'chat' ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <h2 style={{ color: 'var(--text-secondary)' }}>Loading administrative metrics...</h2>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && stats && (
                <div className="animate-fade-in">
                  <div className="metrics-grid">
                    <div className="metric-card glass" style={{ borderLeft: '4px solid var(--color-primary)' }}>
                      <div className="metric-header">
                        <span className="metric-title">Platform Users</span>
                        <div className="metric-icon-wrapper">
                          <Users size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.users.tenants + stats.users.landlords}</div>
                      <span className="metric-desc">{stats.users.tenants} Tenants • {stats.users.landlords} Landlords</span>
                    </div>

                    <div className="metric-card glass" style={{ borderLeft: '4px solid var(--color-secondary)' }}>
                      <div className="metric-header">
                        <span className="metric-title">Listings Approved</span>
                        <div className="metric-icon-wrapper">
                          <Home size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.properties.approved}</div>
                      <span className="metric-desc">{stats.properties.pending} pending approval</span>
                    </div>

                    <div className="metric-card glass" style={{ borderLeft: '4px solid var(--color-warning)' }}>
                      <div className="metric-header">
                        <span className="metric-title">Visits Booked</span>
                        <div className="metric-icon-wrapper">
                          <Calendar size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.bookings.total}</div>
                      <span className="metric-desc">{stats.bookings.pending} pending visits</span>
                    </div>

                    <div className="metric-card glass" style={{ borderLeft: '4px solid var(--color-success)' }}>
                      <div className="metric-header">
                        <span className="metric-title">System Revenue</span>
                        <div className="metric-icon-wrapper">
                          <DollarSign size={18} />
                        </div>
                      </div>
                      <div className="metric-value">${stats.revenue}</div>
                      <span className="metric-desc">Aggregate transaction volume</span>
                    </div>
                  </div>

                  {/* Logs Feed */}
                  <div className="analytics-row">
                    <div className="analytics-card glass">
                      <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Recent Visit Requests</h3>
                      <div className="activity-list">
                        {stats.logs.bookings.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)' }}>No visit requests logged yet.</p>
                        ) : (
                          stats.logs.bookings.map(bk => (
                            <div key={bk._id} className="activity-item">
                              <div className="activity-icon">
                                <Calendar size={14} />
                              </div>
                              <div className="activity-info">
                                <div className="activity-text">
                                  <strong>{bk.tenant?.name || 'Tenant'}</strong> booked visit for <strong>{bk.property?.title}</strong>
                                </div>
                                <div className="activity-time">Requested on {new Date(bk.visitDate).toLocaleDateString()} at {bk.visitTime}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="analytics-card glass">
                      <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>Recent Registration Logs</h3>
                      <div className="activity-list">
                        {stats.logs.registrations.map(reg => (
                          <div key={reg._id} className="activity-item">
                            <div className="activity-icon">
                              <Users size={14} />
                            </div>
                            <div className="activity-info">
                              <div className="activity-text">
                                <strong>{reg.name}</strong> registered as a <span style={{ textTransform: 'capitalize', fontWeight: 600, color: reg.role === 'landlord' ? 'var(--color-secondary)' : 'var(--color-primary)' }}>{reg.role}</span>
                              </div>
                              <div className="activity-time">{new Date(reg.createdAt).toLocaleDateString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MANAGE USERS */}
              {activeTab === 'users' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Manage Registered Users</h3>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="Search name or email..." 
                        style={{ width: '220px', padding: '0.5rem 1rem' }}
                        value={searchUser}
                        onChange={(e) => setSearchUser(e.target.value)}
                      />
                      <select 
                        className="form-select" 
                        style={{ width: '150px', padding: '0.5rem 1rem' }}
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                      >
                        <option value="">All Roles</option>
                        <option value="tenant">Tenants</option>
                        <option value="landlord">Landlords</option>
                      </select>
                    </div>
                  </div>

                  {usersList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No users found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>User Details</th>
                            <th>Email Address</th>
                            <th>Role</th>
                            <th>Phone</th>
                            <th>Joined Date</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map(usr => (
                            <tr key={usr._id}>
                              <td style={{ fontWeight: 600 }}>{usr.name}</td>
                              <td>{usr.email}</td>
                              <td>
                                <span className={`badge ${usr.role === 'landlord' ? 'badge-info' : 'badge-success'}`}>
                                  {usr.role}
                                </span>
                              </td>
                              <td>{usr.phone || '-'}</td>
                              <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                              <td>
                                <span className={`badge ${usr.isBlocked ? 'badge-danger' : 'badge-success'}`}>
                                  {usr.isBlocked ? 'Suspended' : 'Active'}
                                </span>
                              </td>
                              <td>
                                {usr.role !== 'admin' && (
                                  <button 
                                    className={`btn ${usr.isBlocked ? 'btn-success' : 'btn-danger'}`} 
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                    onClick={() => handleToggleBlockUser(usr._id, usr.isBlocked)}
                                  >
                                    {usr.isBlocked ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />} 
                                    {usr.isBlocked ? 'Reinstate' : 'Suspend'}
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

              {/* TAB 3: PROPERTIES APPROVAL */}
              {activeTab === 'properties' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">Listed Properties Directory</h3>
                    <select 
                      className="form-select" 
                      style={{ width: '180px', padding: '0.5rem 1rem' }}
                      value={filterPropStatus}
                      onChange={(e) => setFilterPropStatus(e.target.value)}
                    >
                      <option value="all">All Listings</option>
                      <option value="approved">Approved Listings</option>
                      <option value="pending">Pending Approval</option>
                    </select>
                  </div>

                  {filteredProperties.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No property listings matched selection.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Listing Title</th>
                            <th>Address</th>
                            <th>Rent Rate</th>
                            <th>Details</th>
                            <th>Landlord</th>
                            <th>Approval Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredProperties.map(prop => (
                            <tr key={prop._id}>
                              <td style={{ fontWeight: 600 }}>{prop.title}</td>
                              <td>{prop.address}</td>
                              <td style={{ fontWeight: 700 }}>${prop.rent}/mo</td>
                              <td>{prop.beds} Bed, {prop.baths} Bath ({prop.propertyType})</td>
                              <td>{prop.owner?.name || 'Unknown'}</td>
                              <td>
                                <span className={`badge ${prop.isApproved ? 'badge-success' : 'badge-warning'}`}>
                                  {prop.isApproved ? 'Approved' : 'Pending'}
                                </span>
                              </td>
                              <td style={{ display: 'flex', gap: '0.5rem' }}>
                                <button 
                                  className={`btn ${prop.isApproved ? 'btn-secondary' : 'btn-success'}`}
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                  onClick={() => handleToggleApproveProp(prop._id, prop.isApproved)}
                                >
                                  {prop.isApproved ? 'Revoke Approval' : 'Approve'}
                                </button>
                                <button 
                                  className="btn btn-danger"
                                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                  onClick={() => handleDeleteProp(prop._id)}
                                >
                                  <Trash2 size={12} /> Delete
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

              {/* TAB 4: MANAGED BOOKINGS */}
              {activeTab === 'bookings' && (
                <div className="analytics-card glass animate-fade-in">
                  <div className="card-header-bar">
                    <h3 className="card-title">House Visit Bookings</h3>
                  </div>

                  {bookingsList.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>No booking records found.</p>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Tenant details</th>
                            <th>Property Title</th>
                            <th>Landlord</th>
                            <th>Scheduled Date</th>
                            <th>Scheduled Time</th>
                            <th>Booking Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingsList.map(bk => (
                            <tr key={bk._id}>
                              <td style={{ fontWeight: 600 }}>
                                {bk.tenant?.name || 'Tenant'}
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>{bk.tenant?.email}</div>
                              </td>
                              <td>{bk.property?.title || 'Property Deleted'}</td>
                              <td>{bk.property?.owner?.name || 'Unknown'}</td>
                              <td>{new Date(bk.visitDate).toLocaleDateString()}</td>
                              <td>{bk.visitTime}</td>
                              <td>
                                <span className={`badge ${
                                  bk.status === 'approved' ? 'badge-success' :
                                  bk.status === 'rejected' ? 'badge-danger' : 'badge-warning'
                                }`}>
                                  {bk.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: BROADCAST ANNOUNCEMENTS */}
              {activeTab === 'broadcast' && (
                <div className="analytics-card glass animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h3 className="card-title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Megaphone style={{ color: 'var(--color-primary)' }} /> Broadcast Platform Announcement
                  </h3>

                  {broadcastSuccess && (
                    <div className="badge badge-success" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', justifyContent: 'center' }}>
                      {broadcastSuccess}
                    </div>
                  )}

                  <form onSubmit={handlePublishBroadcast}>
                    <div className="form-group">
                      <label className="form-label">Announcement Title</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. Platform System Maintenance Schedule"
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Detailed Message</label>
                      <textarea 
                        className="form-textarea" 
                        rows="6" 
                        placeholder="Type the message that will be broadcasted to all active Tenant and Landlord notification feeds..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      Publish Announcement
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 6: SYSTEM CHAT */}
              {activeTab === 'chat' && (
                <Chat token={token} currentUser={user} />
              )}

              {/* TAB 7: PROFILE */}
              {activeTab === 'profile' && (
                <div className="analytics-card glass animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Administrator Profile</h3>
                  
                  {profileSuccess && <div className="badge badge-success" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', justifyContent: 'center' }}>{profileSuccess}</div>}
                  {profileError && <div className="badge badge-danger" style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', justifyContent: 'center' }}>{profileError}</div>}
                  
                  <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>System Role:</span>
                      <strong style={{ color: 'var(--color-danger)', textTransform: 'capitalize' }}>{user.role}</strong>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdateSubmit}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profName} 
                        onChange={(e) => setProfName(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address (Assigns new login email)</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={profEmail} 
                        onChange={(e) => setProfEmail(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">New Password (Leave blank to keep current password)</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="••••••••"
                        value={profPassword} 
                        onChange={(e) => setProfPassword(e.target.value)} 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        value={profPhone} 
                        onChange={(e) => setProfPhone(e.target.value)} 
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">About Me (Bio)</label>
                      <textarea 
                        className="form-textarea" 
                        rows="4" 
                        value={profBio} 
                        onChange={(e) => setProfBio(e.target.value)} 
                        placeholder="Administrator biography..."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      Update Admin Profile & Password
                    </button>
                  </form>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem' }}>
                    <h4 style={{ color: 'var(--color-danger)', marginBottom: '0.5rem' }}>Session Settings</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Log out of your active HouseHunt session on this device.</p>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
