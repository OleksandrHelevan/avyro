// 001_users_specializations.js
// Align Users and Specializations with current backend entities.

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

print('Starting migration 001: Users + Specializations');

createOrUpdateCollection('Specializations', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'createdAt'],
    properties: {
      name: { bsonType: 'string' },
      description: { bsonType: ['string', 'null'] },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string', 'null'] }
    }
  }
});

avyroDb.Specializations.updateMany(
  { description: { $exists: false } },
  { $set: { description: '' } }
);
avyroDb.Specializations.updateMany(
  { createdAt: { $exists: false } },
  { $set: { createdAt: now } }
);

safeIndex('Specializations', { name: 1 }, { unique: true, name: 'ux_name' });

createOrUpdateCollection('Users', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['email', 'password', 'role', 'isActive', 'createdAt', 'updatedAt'],
    properties: {
      email: { bsonType: 'string' },
      password: { bsonType: 'string' },
      role: { enum: ['PATIENT', 'DOCTOR', 'ADMIN'] },
      isActive: { bsonType: 'bool' },
      profile: {
        bsonType: ['object', 'null'],
        properties: {
          fullName: { bsonType: ['string', 'null'] },
          phone: { bsonType: ['string', 'null'] },
          specializationId: { bsonType: ['objectId', 'string', 'null'] },
          specialization_id: { bsonType: ['objectId', 'string', 'null'] },
          avatarUrl: { bsonType: ['string', 'null'] },
          address: { bsonType: ['string', 'null'] }
        }
      },
      createdAt: { bsonType: ['date', 'string'] },
      updatedAt: { bsonType: ['date', 'string'] },
      lastLoginAt: { bsonType: ['date', 'string', 'null'] },
      deletedAt: { bsonType: ['date', 'string', 'null'] }
    }
  }
});

// Normalize legacy profile names to current backend format.
avyroDb.Users.find({ profile: { $type: 'object' } }).forEach(function(user) {
  var set = {};
  var unset = {};
  var p = user.profile || {};

  if (p.fullName === undefined && p.full_name !== undefined) set['profile.fullName'] = p.full_name;
  if (p.avatarUrl === undefined && p.avatar_url !== undefined) set['profile.avatarUrl'] = p.avatar_url;
  if (p.specializationId === undefined && p.specialization_id !== undefined) set['profile.specializationId'] = p.specialization_id;

  if (p.phone === undefined) set['profile.phone'] = null;
  if (p.avatarUrl === undefined && p.avatar_url === undefined) set['profile.avatarUrl'] = null;
  if (p.address === undefined) set['profile.address'] = null;
  if (p.specializationId === undefined && p.specialization_id === undefined) set['profile.specializationId'] = null;

  if (Object.keys(set).length > 0) {
    set.updatedAt = now;
    avyroDb.Users.updateOne({ _id: user._id }, { $set: set });
  }
});

avyroDb.Users.updateMany({ isActive: { $exists: false } }, { $set: { isActive: true } });
avyroDb.Users.updateMany({ createdAt: { $exists: false } }, { $set: { createdAt: now } });
avyroDb.Users.updateMany({ updatedAt: { $exists: false } }, { $set: { updatedAt: now } });
avyroDb.Users.updateMany({ lastLoginAt: { $exists: false } }, { $set: { lastLoginAt: null } });
avyroDb.Users.updateMany({ deletedAt: { $exists: false } }, { $set: { deletedAt: null } });

safeIndex('Users', { email: 1 }, { unique: true, name: 'ux_email' });
safeIndex('Users', { role: 1 }, { name: 'ix_role' });
safeIndex('Users', { 'profile.specializationId': 1 }, { name: 'ix_profile_specializationId' });
safeIndex('Users', { 'profile.specialization_id': 1 }, { name: 'ix_profile_specialization_id_legacy' });

print('Migration 001 completed.');
