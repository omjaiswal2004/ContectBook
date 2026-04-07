const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');

// Protect all contact routes
router.use(auth);

// GET all contacts (with optional search query) for logged in user
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;
    let query = { userId: req.user.id };
    
    if (q) {
      const searchRegex = new RegExp(q, 'i');
      query.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ];
    }
    const contacts = await Contact.find(query).sort({ name: 1 });
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new contact
router.post('/', async (req, res) => {
  try {
    const contact = new Contact({ ...req.body, userId: req.user.id });
    await contact.save();
    res.status(201).json(contact);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a contact
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found or unauthorized' });
    }
    res.json({ message: 'Contact deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT to update a contact
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact not found or unauthorized' });
    }
    res.json(updatedContact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST merge two contacts
router.post('/merge', async (req, res) => {
  try {
    const { primaryId, secondaryId, newName, newEmail } = req.body;
    if (primaryId === secondaryId) {
      return res.status(400).json({ error: 'Cannot merge a contact with itself' });
    }

    const primaryContact = await Contact.findOne({ _id: primaryId, userId: req.user.id });
    const secondaryContact = await Contact.findOne({ _id: secondaryId, userId: req.user.id });

    if (!primaryContact || !secondaryContact) {
      return res.status(404).json({ error: 'One or both contacts not found or unauthorized' });
    }

    if (newName) primaryContact.name = newName;
    
    // Combine emails if different
    if (newEmail) {
      primaryContact.email = newEmail;
    } else if (secondaryContact.email && primaryContact.email !== secondaryContact.email) {
      if (!primaryContact.email) primaryContact.email = secondaryContact.email;
      else if (!primaryContact.email.includes(secondaryContact.email)) primaryContact.email += `, ${secondaryContact.email}`;
    }

    // Combine phones if different
    if (secondaryContact.phone && primaryContact.phone !== secondaryContact.phone) {
      if (!primaryContact.phone) primaryContact.phone = secondaryContact.phone;
      else if (!primaryContact.phone.includes(secondaryContact.phone)) primaryContact.phone += `, ${secondaryContact.phone}`;
    }

    // Combine addresses if different
    if (secondaryContact.address && primaryContact.address !== secondaryContact.address) {
      if (!primaryContact.address) primaryContact.address = secondaryContact.address;
      else if (!primaryContact.address.includes(secondaryContact.address)) primaryContact.address += ` | ${secondaryContact.address}`;
    }

    if (!primaryContact.notes && secondaryContact.notes) primaryContact.notes = secondaryContact.notes;

    // Combine notes if both have them?
    if (primaryContact.notes && secondaryContact.notes && primaryContact.notes !== secondaryContact.notes) {
      if (!primaryContact.notes.includes(secondaryContact.notes)) {
        primaryContact.notes += `\n--- Merged Notes ---\n${secondaryContact.notes}`;
      }
    }

    await primaryContact.save();
    
    // Delete the secondary contact
    await Contact.findOneAndDelete({ _id: secondaryId, userId: req.user.id });

    res.json({ message: 'Contacts merged successfully', contact: primaryContact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
