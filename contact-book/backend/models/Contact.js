const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  address: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

contactSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Contact', contactSchema);
