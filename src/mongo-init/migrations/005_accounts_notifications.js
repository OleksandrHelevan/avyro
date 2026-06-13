// 005_accounts_notifications.js
// Create/update Accounts and lowercase notifications collections.

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

print('Starting migration 005: Accounts + notifications');

createOrUpdateCollection('Accounts', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['user_id', 'stripe_customer_id', 'balance', 'cards', 'is_active', 'created_at', 'updated_at'],
    properties: {
      user_id: { bsonType: ['objectId', 'string'] },
      stripe_customer_id: { bsonType: 'string' },
      balance: { bsonType: ['double', 'int', 'long', 'decimal'] },
      pin: { bsonType: ['string', 'null'] },
      cards: {
        bsonType: 'array',
        items: {
          bsonType: 'object',
          properties: {
            stripe_payment_method_id: { bsonType: 'string' },
            last4: { bsonType: 'string' },
            brand: { bsonType: 'string' },
            exp_month: { bsonType: ['int', 'long'] },
            exp_year: { bsonType: ['int', 'long'] },
            is_default: { bsonType: 'bool' }
          }
        }
      },
      is_active: { bsonType: 'bool' },
      created_at: { bsonType: ['date', 'string'] },
      updated_at: { bsonType: ['date', 'string'] }
    }
  }
});

avyroDb.Accounts.updateMany({ balance: { $exists: false } }, { $set: { balance: 0.0 } });
avyroDb.Accounts.updateMany({ cards: { $exists: false } }, { $set: { cards: [] } });
avyroDb.Accounts.updateMany({ is_active: { $exists: false } }, { $set: { is_active: true } });
avyroDb.Accounts.updateMany({ created_at: { $exists: false } }, { $set: { created_at: now } });
avyroDb.Accounts.updateMany({ updated_at: { $exists: false } }, { $set: { updated_at: now } });
avyroDb.Accounts.updateMany({ pin: { $exists: false } }, { $set: { pin: null } });

safeIndex('Accounts', { user_id: 1 }, { unique: true, name: 'ux_user_id' });
safeIndex('Accounts', { stripe_customer_id: 1 }, { unique: true, sparse: true, name: 'ux_stripe_customer_id' });

// Migrate legacy uppercase Notifications collection into current lowercase notifications collection if present.
if (avyroDb.getCollectionNames().includes('Notifications')) {
  print('Legacy Notifications collection found. Copying missing docs into lowercase notifications.');
  avyroDb.Notifications.find().forEach(function(doc) {
    if (!avyroDb.notifications.findOne({ _id: doc._id })) {
      avyroDb.notifications.insertOne(doc);
    }
  });
}

createOrUpdateCollection('notifications', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['message', 'is_read', 'is_read_by', 'sent_at', 'notification_type'],
    properties: {
      message: { bsonType: 'string' },
      recipient_id: { bsonType: ['string', 'objectId', 'null'] },
      is_read_by: { bsonType: 'array' },
      is_read: { bsonType: 'bool' },
      sent_at: { bsonType: ['date', 'string'] },
      appointment_id: { bsonType: ['string', 'objectId', 'null'] },
      notification_type: { bsonType: ['string', 'null'] }
    }
  }
});

avyroDb.notifications.updateMany({ is_read_by: { $exists: false } }, { $set: { is_read_by: [] } });
avyroDb.notifications.updateMany({ is_read: { $exists: false } }, { $set: { is_read: false } });
avyroDb.notifications.updateMany({ sent_at: { $exists: false } }, { $set: { sent_at: now } });
avyroDb.notifications.updateMany({ notification_type: { $exists: false } }, { $set: { notification_type: 'GENERAL' } });
avyroDb.notifications.updateMany({ appointment_id: { $exists: false } }, { $set: { appointment_id: null } });

safeIndex('notifications', { recipient_id: 1, sent_at: -1 }, { name: 'ix_recipient_sentAt' });
safeIndex('notifications', { appointment_id: 1 }, { name: 'ix_appointment_id' });
safeIndex('notifications', { notification_type: 1 }, { name: 'ix_notification_type' });

print('Migration 005 completed.');
