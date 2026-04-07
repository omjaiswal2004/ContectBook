import React, { useState, useEffect } from 'react';
import { getContacts, createContact, deleteContact, mergeContacts, updateContact } from './api';
import { Search, Plus, Trash2, Mail, Phone, MapPin, Merge, X, Users, Edit2, LogOut } from 'lucide-react';
import Auth from './Auth';
import './index.css';

const ContactCard = ({ contact, onDelete, onEdit, onSelect, isSelected, selectableMode }) => {
  return (
    <div className={`glass-panel ${isSelected ? 'selected' : ''}`} style={isSelected ? { borderColor: 'var(--primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'} : {}}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {selectableMode && (
            <input 
              type="checkbox" 
              className="select-checkbox" 
              checked={isSelected}
              onChange={() => onSelect(contact)} 
            />
          )}
          <div className="avatar">
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>{contact.name}</h3>
          </div>
        </div>
      </div>
      
      <div className="flex-col gap-2" style={{ color: 'var(--text-secondary)' }}>
        {contact.phone && (
          <div className="flex items-center gap-2">
            <Phone size={16} /> <span>{contact.phone}</span>
          </div>
        )}
        {contact.email && (
          <div className="flex items-center gap-2">
            <Mail size={16} /> <span>{contact.email}</span>
          </div>
        )}
        {contact.address && (
          <div className="flex items-center gap-2">
            <MapPin size={16} /> <span>{contact.address}</span>
          </div>
        )}
        {contact.notes && (
          <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.875rem' }}>
            {contact.notes}
          </div>
        )}
      </div>

      <div className="contact-card-actions" style={{ justifyContent: 'flex-end' }}>
        {!selectableMode && (
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-icon-only" onClick={() => onEdit(contact)}>
              <Edit2 size={16} />
            </button>
            <button className="btn btn-danger btn-icon-only" onClick={() => onDelete(contact._id)}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectableMode, setSelectableMode] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [mergeConflict, setMergeConflict] = useState(false);
  const [conflictData, setConflictData] = useState({ name: '', email: '' });
  
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [editContactData, setEditContactData] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setContacts([]);
  };

  const fetchContacts = async (query = '') => {
    try {
      const data = await getContacts(query);
      setContacts(data);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (!authToken) return;
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchContacts(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, authToken]);

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      await createContact(newContact);
      setIsFormOpen(false);
      setNewContact({ name: '', phone: '', email: '', address: '', notes: '' });
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert('Failed to create contact');
    }
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      await updateContact(editContactData._id, editContactData);
      setIsEditFormOpen(false);
      setEditContactData(null);
      fetchContacts();
    } catch (err) {
      console.error(err);
      alert('Failed to update contact');
    }
  };

  const openEditModal = (contact) => {
    setEditContactData({ ...contact });
    setIsEditFormOpen(true);
  };

  const handleDeleteContact = async (id) => {
    if (window.confirm('Delete this contact?')) {
      try {
        await deleteContact(id);
        fetchContacts();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const toggleSelectForMerge = (contact) => {
    const isAlreadySelected = selectedForMerge.find(c => c._id === contact._id);
    if (isAlreadySelected) {
      setSelectedForMerge(selectedForMerge.filter(c => c._id !== contact._id));
    } else {
      if (selectedForMerge.length < 2) {
        setSelectedForMerge([...selectedForMerge, contact]);
      } else {
        alert("You can only select up to 2 contacts to merge.");
      }
    }
  };

  const executeMerge = async (newName = null, newEmail = null) => {
    try {
      const primaryId = selectedForMerge[0]._id;
      const secondaryId = selectedForMerge[1]._id;
      await mergeContacts(primaryId, secondaryId, newName, newEmail);
      setSelectableMode(false);
      setSelectedForMerge([]);
      setMergeConflict(false);
      setConflictData({ name: '', email: '' });
      fetchContacts();
      alert("Contacts successfully merged!");
    } catch (err) {
      console.error(err);
      alert('Failed to merge contacts');
    }
  };

  const handleMerge = async () => {
    if (selectedForMerge.length !== 2) {
      alert("Please select exactly 2 contacts to merge.");
      return;
    }
    
    const p = selectedForMerge[0];
    const s = selectedForMerge[1];

    const hasSameName = p.name.trim().toLowerCase() === s.name.trim().toLowerCase();
    const hasSameEmail = p.email && s.email && p.email.trim().toLowerCase() === s.email.trim().toLowerCase();

    if (hasSameName || hasSameEmail) {
      await executeMerge();
    } else {
      // Need manually resolved name/email
      setConflictData({ name: p.name, email: p.email || s.email || '' });
      setMergeConflict(true);
    }
  };

  if (!authToken) {
    return <Auth setAuthToken={setAuthToken} />;
  }

  return (
    <div className="container">
      <header className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={36} /> ContactBook
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Manage your connections gracefully</p>
        </div>
        <div className="flex gap-4">
          <button 
            className={`btn ${selectableMode ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              if (selectableMode) {
                setSelectableMode(false);
                setSelectedForMerge([]);
              } else {
                setSelectableMode(true);
              }
            }}
          >
            <Merge size={18} /> {selectableMode ? 'Cancel Merge' : 'Merge Mode'}
          </button>
          {!selectableMode && (
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              <Plus size={18} /> Add Contact
            </button>
          )}
          <button className="btn btn-secondary" onClick={handleLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      {selectableMode && (
        <div className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontWeight: 600 }}>Merge Contacts</span>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Select 2 contacts to merge them into one.</p>
          </div>
          <button 
            className="btn btn-primary" 
            disabled={selectedForMerge.length !== 2}
            onClick={handleMerge}
          >
            Merge {selectedForMerge.length}/2
          </button>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Search size={20} style={{ color: 'var(--text-secondary)', marginLeft: '1rem' }} />
        <input 
          type="text" 
          placeholder="Search by name, email, or phone..." 
          style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: '0.5rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="contacts-grid">
        {contacts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            No contacts found.
          </div>
        ) : (
          contacts.map(contact => (
            <ContactCard 
              key={contact._id} 
              contact={contact} 
              onDelete={handleDeleteContact}
              onEdit={openEditModal}
              selectableMode={selectableMode}
              isSelected={!!selectedForMerge.find(c => c._id === contact._id)}
              onSelect={toggleSelectForMerge}
            />
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Contact</h2>
              <button className="btn-icon-only" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsFormOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form id="contactForm" onSubmit={handleCreateContact}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required type="text" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={newContact.email} onChange={e => setNewContact({...newContact, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Home/Work Address</label>
                  <input type="text" value={newContact.address} onChange={e => setNewContact({...newContact, address: e.target.value})} placeholder="123 Main St, City" />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea rows="3" value={newContact.notes} onChange={e => setNewContact({...newContact, notes: e.target.value})} placeholder="Any additional info..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button form="contactForm" type="submit" className="btn btn-primary">Save Contact</button>
            </div>
          </div>
        </div>
      )}

      {mergeConflict && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Merge Conflict Resolution</h2>
              <button className="btn-icon-only" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setMergeConflict(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                These contacts do not share a common name or email. Please provide the final Name and Email for the merged contact:
              </p>
              <form id="conflictForm" onSubmit={(e) => { e.preventDefault(); executeMerge(conflictData.name, conflictData.email); }}>
                <div className="form-group">
                  <label>Merged Name *</label>
                  <input required type="text" value={conflictData.name} onChange={e => setConflictData({...conflictData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Merged Email</label>
                  <input type="email" value={conflictData.email} onChange={e => setConflictData({...conflictData, email: e.target.value})} />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMergeConflict(false)}>Cancel</button>
              <button form="conflictForm" type="submit" className="btn btn-primary">Confirm Merge</button>
            </div>
          </div>
        </div>
      )}

      {isEditFormOpen && editContactData && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Contact</h2>
              <button className="btn-icon-only" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onClick={() => setIsEditFormOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form id="editForm" onSubmit={handleUpdateContact}>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input required type="text" value={editContactData.name} onChange={e => setEditContactData({...editContactData, name: e.target.value})} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" value={editContactData.phone} onChange={e => setEditContactData({...editContactData, phone: e.target.value})} placeholder="+1 234 567 890" />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={editContactData.email} onChange={e => setEditContactData({...editContactData, email: e.target.value})} placeholder="john@example.com" />
                </div>
                <div className="form-group">
                  <label>Home/Work Address</label>
                  <input type="text" value={editContactData.address} onChange={e => setEditContactData({...editContactData, address: e.target.value})} placeholder="123 Main St, City" />
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea rows="3" value={editContactData.notes} onChange={e => setEditContactData({...editContactData, notes: e.target.value})} placeholder="Any additional info..." />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsEditFormOpen(false)}>Cancel</button>
              <button form="editForm" type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
