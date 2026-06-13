// 002_schedules_slots.js
// Align Schedules with current backend entity and migrate standalone Slots into Schedules.slots[].

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

function slotEquals(a, b) {
  if (a === undefined || a === null || b === undefined || b === null) return false;
  return String(a) === String(b);
}

print('Starting migration 002: Schedules + embedded slots');

// Make existing schedules match current Schedule.py shape before strict validation.
avyroDb.Schedules.find().forEach(function(schedule) {
  var set = {};
  if (schedule.month === undefined || schedule.month === null) {
    var date = schedule.createdAt instanceof Date ? schedule.createdAt : now;
    set.month = date.getUTCMonth() + 1;
  }
  if (schedule.year === undefined || schedule.year === null) {
    var ydate = schedule.createdAt instanceof Date ? schedule.createdAt : now;
    set.year = ydate.getUTCFullYear();
  }
  if (schedule.title === undefined || schedule.title === null || schedule.title === '') set.title = 'Generated schedule';
  if (schedule.isRepeated === undefined) set.isRepeated = false;
  if (schedule.repeating === undefined || schedule.repeating === null) set.repeating = {};
  if (schedule.slots === undefined || schedule.slots === null) set.slots = [];
  if (schedule.status === undefined || schedule.status === null) set.status = 'APPROVED';
  if (schedule.pricePerSlot === undefined || schedule.pricePerSlot === null) set.pricePerSlot = 0.0;
  if (schedule.createdAt === undefined || schedule.createdAt === null) set.createdAt = now;
  set.updatedAt = now;

  if (Object.keys(set).length > 0) {
    avyroDb.Schedules.updateOne({ _id: schedule._id }, { $set: set });
  }
});

// If old seed created standalone Slots collection, embed those slots into related schedules.
if (avyroDb.getCollectionNames().includes('Slots')) {
  print('Standalone Slots collection found. Embedding Slots into Schedules.slots[].');
  avyroDb.Slots.find().forEach(function(slot) {
    if (!slot.scheduleId) return;
    var schedule = avyroDb.Schedules.findOne({ _id: slot.scheduleId });
    if (!schedule) return;

    var slots = schedule.slots || [];
    var exists = slots.some(function(s) { return slotEquals(s.slotId, slot._id); });
    if (!exists) {
      var embedded = {
        slotId: slot._id,
        from: slot.from,
        to: slot.to,
        type: slot.type || 'AVAILABLE',
        appointmentId: slot.appointmentId || null
      };
      avyroDb.Schedules.updateOne(
        { _id: schedule._id },
        { $push: { slots: embedded }, $set: { updatedAt: now } }
      );
    }
  });
}

// Normalize embedded slot shape.
avyroDb.Schedules.find({ slots: { $exists: true, $type: 'array' } }).forEach(function(schedule) {
  var changed = false;
  var normalized = (schedule.slots || []).map(function(slot) {
    var s = Object.assign({}, slot);
    if (s.slotId === undefined && s._id !== undefined) {
      s.slotId = s._id;
      delete s._id;
      changed = true;
    }
    if (s.type === undefined || s.type === null) {
      s.type = 'AVAILABLE';
      changed = true;
    }
    if (s.appointmentId === undefined) {
      s.appointmentId = null;
      changed = true;
    }
    return s;
  });
  if (changed) {
    avyroDb.Schedules.updateOne({ _id: schedule._id }, { $set: { slots: normalized, updatedAt: now } });
  }
});

createOrUpdateCollection('Schedules', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['doctorId', 'month', 'year', 'title', 'isRepeated', 'repeating', 'slots', 'status', 'pricePerSlot', 'createdAt', 'updatedAt'],
    properties: {
      doctorId: { bsonType: ['objectId', 'string'] },
      month: { bsonType: ['int', 'long', 'double'] },
      year: { bsonType: ['int', 'long', 'double'] },
      title: { bsonType: 'string' },
      isRepeated: { bsonType: 'bool' },
      repeating: { bsonType: ['object', 'null'] },
      slots: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          required: ['slotId', 'from', 'to', 'type'],
          properties: {
            slotId: { bsonType: ['objectId', 'string'] },
            from: { bsonType: ['date', 'string'] },
            to: { bsonType: ['date', 'string'] },
            type: { enum: ['AVAILABLE', 'RESERVED', 'BLOCKED'] },
            appointmentId: { bsonType: ['objectId', 'string', 'null'] }
          }
        }
      },
      status: { enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      pricePerSlot: { bsonType: ['double', 'int', 'long', 'decimal'] },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string'] }
    }
  }
});

safeIndex('Schedules', { doctorId: 1 }, { name: 'ix_doctorId' });
safeIndex('Schedules', { doctorId: 1, year: 1, month: 1 }, { name: 'ix_doctor_year_month' });
safeIndex('Schedules', { 'slots.slotId': 1 }, { name: 'ix_slots_slotId' });

print('Migration 002 completed.');
