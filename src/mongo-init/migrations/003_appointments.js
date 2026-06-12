// 003_appointments.js
// Align Appointments with current backend entity: status enum, from/to, notes array, payment fields.

var avyroDb = db.getSiblingDB('avyro');
var now = new Date();

function createOrUpdateCollection(name, validator) {
  if (!avyroDb.getCollectionNames().includes(name)) {
    avyroDb.createCollection(name, {
      validator: validator,
      validationLevel: 'moderate',
      validationAction: 'error'
    });
    print('Created collection: ' + name);
  } else {
    avyroDb.runCommand({
      collMod: name,
      validator: validator,
      validationLevel: 'moderate',
      validationAction: 'error'
    });
    print('Updated validator: ' + name);
  }
}

function safeIndex(collection, keys, options) {
  try {
    avyroDb[collection].createIndex(keys, options || {});
    print('Index ensured: ' + collection + ' ' + JSON.stringify(keys));
  } catch (e) {
    print('Index skipped/failed: ' + collection + ' ' + JSON.stringify(keys) + ' -> ' + e.message);
  }
}

function findSlot(slotId) {
  if (!slotId) return null;
  var schedule = avyroDb.Schedules.findOne({ 'slots.slotId': slotId }, { 'slots.$': 1 });
  if (schedule && schedule.slots && schedule.slots.length) return schedule.slots[0];

  schedule = avyroDb.Schedules.findOne({ 'slots.slotId': String(slotId) }, { 'slots.$': 1 });
  if (schedule && schedule.slots && schedule.slots.length) return schedule.slots[0];

  if (avyroDb.getCollectionNames().includes('Slots')) {
    var legacySlot = avyroDb.Slots.findOne({ _id: slotId });
    if (legacySlot) return legacySlot;
    legacySlot = avyroDb.Slots.findOne({ _id: String(slotId) });
    if (legacySlot) return legacySlot;
  }
  return null;
}

function normalizeNotes(notes, fallbackDate) {
  if (Array.isArray(notes)) return notes;
  if (typeof notes === 'string' && notes.trim().length > 0) {
    return [{
      source: 'PATIENT',
      message: notes,
      type: 'SPECIFICATION',
      createdAt: fallbackDate || now
    }];
  }
  return [];
}

print('Starting migration 003: Appointments');

avyroDb.Appointments.find().forEach(function(app) {
  var set = {};
  var slot = findSlot(app.slotId);

  if ((app.from === undefined || app.from === null) && slot && slot.from) set.from = slot.from;
  if ((app.to === undefined || app.to === null) && slot && slot.to) set.to = slot.to;

  if (app.status === undefined || app.status === null) set.status = 'PLANNED';
  if (app.paymentStatus === undefined || app.paymentStatus === null) set.paymentStatus = 'PENDING';
  if (app.basePrice === undefined || app.basePrice === null) set.basePrice = 0.0;
  if (app.finalPrice === undefined || app.finalPrice === null) set.finalPrice = app.basePrice || 0.0;
  if (app.discount === undefined || app.discount === null) set.discount = 0.0;
  if (app.isDiscountUsed === undefined || app.isDiscountUsed === null) set.isDiscountUsed = false;
  if (app.appointmentType === undefined || app.appointmentType === null) set.appointmentType = 'VISIT';
  if (app.bookedAt === undefined || app.bookedAt === null) set.bookedAt = app.createdAt || now;
  if (app.createdAt === undefined || app.createdAt === null) set.createdAt = now;
  if (app.updatedAt === undefined || app.updatedAt === null) set.updatedAt = now;
  if (app.completedAt === undefined) set.completedAt = null;
  if (app.cancelledAt === undefined) set.cancelledAt = null;
  if (app.cancelReason === undefined) set.cancelReason = null;

  var normalizedNotes = normalizeNotes(app.notes, app.createdAt || now);
  if (!Array.isArray(app.notes) || JSON.stringify(app.notes) !== JSON.stringify(normalizedNotes)) {
    set.notes = normalizedNotes;
  }

  if (Object.keys(set).length > 0) {
    set.updatedAt = now;
    avyroDb.Appointments.updateOne({ _id: app._id }, { $set: set });
  }
});

createOrUpdateCollection('Appointments', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['patientId', 'doctorId', 'slotId', 'status', 'paymentStatus', 'basePrice', 'finalPrice', 'appointmentType', 'bookedAt', 'createdAt', 'updatedAt'],
    properties: {
      patientId: { bsonType: ['objectId', 'string'] },
      doctorId: { bsonType: ['objectId', 'string'] },
      slotId: { bsonType: ['objectId', 'string'] },
      from: { bsonType: ['date', 'string', 'null'] },
      to: { bsonType: ['date', 'string', 'null'] },
      status: { enum: ['PLANNED', 'RESERVED', 'FINISHED', 'CANCELLED', 'COMPLETED'] },
      paymentStatus: { enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
      basePrice: { bsonType: ['double', 'int', 'long', 'decimal'] },
      discount: { bsonType: ['double', 'int', 'long', 'decimal', 'null'] },
      isDiscountUsed: { bsonType: ['bool', 'null'] },
      appliedBadgeId: { bsonType: ['objectId', 'string', 'null'] },
      discountAmount: { bsonType: ['double', 'int', 'long', 'decimal', 'null'] },
      finalPrice: { bsonType: ['double', 'int', 'long', 'decimal'] },
      appointmentType: { bsonType: 'string' },
      bookedAt: { bsonType: ['date', 'string'] },
      completedAt: { bsonType: ['date', 'string', 'null'] },
      cancelledAt: { bsonType: ['date', 'string', 'null'] },
      cancelReason: { bsonType: ['string', 'null'] },
      stripeInvoiceId: { bsonType: ['string', 'null'] },
      notes: {
        bsonType: ['array', 'null'],
        items: {
          bsonType: 'object',
          properties: {
            source: { enum: ['PATIENT', 'DOCTOR'] },
            message: { bsonType: 'string' },
            type: { enum: ['SPECIFICATION', 'RECEIPT'] },
            createdAt: { bsonType: ['date', 'string'] }
          }
        }
      },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string'] }
    }
  }
});

safeIndex('Appointments', { patientId: 1, bookedAt: 1 }, { name: 'ix_patientId_bookedAt' });
safeIndex('Appointments', { doctorId: 1, bookedAt: 1 }, { name: 'ix_doctorId_bookedAt' });
safeIndex('Appointments', { slotId: 1 }, { unique: true, name: 'ux_slotId' });
safeIndex('Appointments', { status: 1, to: 1 }, { name: 'ix_status_to' });

print('Migration 003 completed.');
