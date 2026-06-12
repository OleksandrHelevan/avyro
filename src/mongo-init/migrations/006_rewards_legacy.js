// 006_rewards_legacy.js
// Align Rewards with current Reward.py and keep legacy/seed collections usable.

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

print('Starting migration 006: Rewards + legacy seed collections');

// Normalize Reward.source from string to object if needed.
avyroDb.Rewards.find().forEach(function(reward) {
  var set = {};
  if (typeof reward.source === 'string') {
    set.source = { type: reward.source };
  }
  if (reward.source && typeof reward.source === 'object' && reward.source.type === 'APPOINTMENT') {
    // Keep legacy APPOINTMENT valid; backend also uses FIRST_VISIT_BONUS/APPOINTMENT_PAYMENT.
  }
  if (reward.specializationId === undefined) set.specializationId = null;
  if (reward.description === undefined) set.description = '';
  if (reward.createdAt === undefined || reward.createdAt === null) set.createdAt = now;
  if (Object.keys(set).length > 0) {
    avyroDb.Rewards.updateOne({ _id: reward._id }, { $set: set });
  }
});

createOrUpdateCollection('Rewards', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['patientId', 'points', 'type', 'source', 'createdAt'],
    properties: {
      patientId: { bsonType: ['objectId', 'string'] },
      specializationId: { bsonType: ['objectId', 'string', 'null'] },
      points: { bsonType: ['int', 'long', 'double'] },
      type: { enum: ['BONUS', 'PENALTY', 'SPEND'] },
      source: {
        bsonType: 'object',
        required: ['type'],
        properties: {
          name: { bsonType: ['string', 'null'] },
          type: { enum: ['PROFILE_BONUS', 'FIRST_VISIT_BONUS', 'APPOINTMENT_PAYMENT', 'APPOINTMENT', 'OTHER'] },
          referenceId: { bsonType: ['objectId', 'string', 'null'] }
        }
      },
      description: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: ['date', 'string'] }
    }
  }
});

safeIndex('Rewards', { patientId: 1, 'source.type': 1 }, { name: 'ix_patientId_sourceType' });
safeIndex('Rewards', { patientId: 1, specializationId: 1 }, { name: 'ix_patientId_specializationId' });

// Keep legacy seed collections valid because seed.js/init.js reference them.
createOrUpdateCollection('Badges', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'level', 'discountPercentage', 'pointsRequired', 'createdAt'],
    properties: {
      name: { bsonType: 'string' },
      description: { bsonType: ['string', 'null'] },
      imgUrl: { bsonType: ['string', 'null'] },
      level: { bsonType: ['int', 'long', 'double'] },
      discountPercentage: { bsonType: ['int', 'long', 'double'] },
      pointsRequired: { bsonType: ['int', 'long', 'double'] },
      specializationId: { bsonType: ['objectId', 'string', 'null'] },
      createdAt: { bsonType: ['date', 'string'] }
    }
  }
});

createOrUpdateCollection('PatientProgress', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['patientId', 'specializationId', 'points', 'totalEarnedPoints', 'updatedAt'],
    properties: {
      patientId: { bsonType: ['objectId', 'string'] },
      specializationId: { bsonType: ['objectId', 'string'] },
      points: { bsonType: ['int', 'long', 'double'] },
      activeBadgeId: { bsonType: ['objectId', 'string', 'null'] },
      totalEarnedPoints: { bsonType: ['int', 'long', 'double'] },
      updatedAt: { bsonType: ['date', 'string'] }
    }
  }
});

createOrUpdateCollection('Transactions', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['appointmentId', 'patientId', 'amount', 'currency', 'status', 'createdAt', 'updatedAt'],
    properties: {
      appointmentId: { bsonType: ['objectId', 'string'] },
      patientId: { bsonType: ['objectId', 'string'] },
      monoInvoiceId: { bsonType: ['string', 'null'] },
      stripeInvoiceId: { bsonType: ['string', 'null'] },
      amount: { bsonType: ['double', 'int', 'long', 'decimal'] },
      currency: { bsonType: 'string' },
      status: { enum: ['CREATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED', 'PAID', 'PENDING'] },
      errorMessage: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string'] }
    }
  }
});

safeIndex('Badges', { specializationId: 1, level: 1 }, { name: 'ix_specializationId_level' });
safeIndex('PatientProgress', { patientId: 1, specializationId: 1 }, { unique: true, name: 'ux_patientId_specializationId' });
safeIndex('Transactions', { monoInvoiceId: 1 }, { unique: true, sparse: true, name: 'ux_monoInvoiceId' });
safeIndex('Transactions', { appointmentId: 1 }, { name: 'ix_appointmentId' });

print('Migration 006 completed.');
