// 004_requests.js
// Create/update Requests collection used by admin approvals.

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

print('Starting migration 004: Requests');

createOrUpdateCollection('Requests', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['type', 'status', 'payload', 'createdAt', 'updatedAt'],
    properties: {
      creatorId: { bsonType: ['objectId', 'string', 'null'] },
      type: { enum: ['DOCTOR_REGISTRATION', 'SCHEDULE_CREATION', 'SPECIALIZATION_CREATION'] },
      status: { enum: ['PENDING', 'APPROVED', 'REJECTED'] },
      payload: { bsonType: 'object' },
      adminComment: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string'] },
      processedAt: { bsonType: ['date', 'string', 'null'] },
      processedBy: { bsonType: ['objectId', 'string', 'null'] }
    }
  }
});

avyroDb.Requests.updateMany({ payload: { $exists: false } }, { $set: { payload: {} } });
avyroDb.Requests.updateMany({ status: { $exists: false } }, { $set: { status: 'PENDING' } });
avyroDb.Requests.updateMany({ createdAt: { $exists: false } }, { $set: { createdAt: now } });
avyroDb.Requests.updateMany({ updatedAt: { $exists: false } }, { $set: { updatedAt: now } });
avyroDb.Requests.updateMany({ adminComment: { $exists: false } }, { $set: { adminComment: null } });
avyroDb.Requests.updateMany({ processedAt: { $exists: false } }, { $set: { processedAt: null } });
avyroDb.Requests.updateMany({ processedBy: { $exists: false } }, { $set: { processedBy: null } });

safeIndex('Requests', { type: 1, status: 1 }, { name: 'ix_type_status' });
safeIndex('Requests', { creatorId: 1 }, { name: 'ix_creatorId' });
safeIndex('Requests', { createdAt: -1 }, { name: 'ix_createdAt_desc' });

print('Migration 004 completed.');
