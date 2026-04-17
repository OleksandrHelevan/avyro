// Avyro MongoDB setup script
// Collections: PascalCase
// Fields: camelCase
// Enum values: UPPER_CASE
// Run with: mongosh "mongodb://localhost:27017/avyro" mongo_setup.js

// Optional cleanup for repeatable local runs:
// db.Users.drop();
// db.Specializations.drop();
// db.Schedules.drop();
// db.Slots.drop();
// db.Appointments.drop();
// db.Rewards.drop();
// db.Badges.drop();
// db.Transactions.drop();
// db.PatientProgress.drop();

function createCollectionSafe(name, options) {
  const exists = db.getCollectionNames().includes(name);
  if (!exists) {
    db.createCollection(name, options);
    print(`Created collection: ${name}`);
  } else {
    print(`Collection already exists: ${name}`);
    if (options && options.validator) {
      db.runCommand({
        collMod: name,
        validator: options.validator,
        validationLevel: 'strict',
        validationAction: 'error'
      });
      print(`Updated validator for: ${name}`);
    }
  }
}

createCollectionSafe('Specializations', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'createdAt'],
      properties: {
        name: { bsonType: 'string', description: 'Required specialization name' },
        description: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Specializations.createIndex({ name: 1 }, { unique: true, name: 'ux_name' });

createCollectionSafe('Users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'role', 'isActive', 'profile', 'createdAt', 'updatedAt'],
      properties: {
        email: { bsonType: 'string' },
        password: { bsonType: 'string' },
        role: { enum: ['PATIENT', 'DOCTOR'] },
        isActive: { bsonType: 'bool' },
        profile: {
          bsonType: 'object',
          required: ['fullName'],
          properties: {
            fullName: { bsonType: 'string' },
            phone: { bsonType: ['string', 'null'] },
            specializationId: { bsonType: ['objectId', 'null'] },
            avatarUrl: { bsonType: ['string', 'null'] }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        lastLoginAt: { bsonType: ['date', 'null'] },
        deletedAt: { bsonType: ['date', 'null'] }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Users.createIndex({ email: 1 }, { unique: true, name: 'ux_email' });
db.Users.createIndex({ 'profile.specializationId': 1 }, { name: 'ix_profileSpecializationId' });

createCollectionSafe('Schedules', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['doctorId', 'title', 'isRepeated', 'createdAt', 'updatedAt'],
      properties: {
        doctorId: { bsonType: 'objectId' },
        title: { bsonType: 'string' },
        isRepeated: { bsonType: 'bool' },
        repeating: {
          bsonType: ['object', 'null'],
          properties: {
            type: { enum: ['WEEKLY', 'CUSTOM'] },
            daysOfWeek: {
              bsonType: ['array', 'null'],
              items: { bsonType: ['int', 'long'] }
            },
            startTime: { bsonType: ['string', 'null'] },
            endTime: { bsonType: ['string', 'null'] },
            slotDuration: { bsonType: ['int', 'long', 'null'] },
            timezone: { bsonType: ['string', 'null'] }
          }
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Schedules.createIndex({ doctorId: 1 }, { name: 'ix_doctorId' });

createCollectionSafe('Slots', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['scheduleId', 'doctorId', 'from', 'to', 'type', 'createdAt'],
      properties: {
        scheduleId: { bsonType: 'objectId' },
        doctorId: { bsonType: 'objectId' },
        from: { bsonType: 'date' },
        to: { bsonType: 'date' },
        type: { enum: ['AVAILABLE', 'BLOCKED'] },
        appointmentId: { bsonType: ['objectId', 'null'] },
        createdAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Slots.createIndex({ doctorId: 1, from: 1 }, { unique: true, name: 'ux_doctorId_from' });
db.Slots.createIndex({ doctorId: 1, from: 1, to: 1 }, { name: 'ix_doctorId_from_to' });
db.Slots.createIndex({ appointmentId: 1 }, { name: 'ix_appointmentId' });

createCollectionSafe('Appointments', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: [
        'patientId', 'doctorId', 'slotId', 'status', 'paymentStatus',
        'basePrice', 'finalPrice', 'appointmentType', 'bookedAt', 'createdAt', 'updatedAt'
      ],
      properties: {
        patientId: { bsonType: 'objectId' },
        doctorId: { bsonType: 'objectId' },
        slotId: { bsonType: 'objectId' },
        status: { enum: ['PLANNED', 'CANCELLED', 'COMPLETED'] },
        paymentStatus: { enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] },
        basePrice: { bsonType: ['double', 'int', 'long', 'decimal'] },
        appliedBadgeId: { bsonType: ['objectId', 'null'] },
        discountAmount: { bsonType: ['double', 'int', 'long', 'decimal', 'null'] },
        finalPrice: { bsonType: ['double', 'int', 'long', 'decimal'] },
        appointmentType: { bsonType: 'string' },
        bookedAt: { bsonType: 'date' },
        completedAt: { bsonType: ['date', 'null'] },
        cancelledAt: { bsonType: ['date', 'null'] },
        cancelReason: { bsonType: ['string', 'null'] },
        notes: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Appointments.createIndex({ patientId: 1, bookedAt: 1 }, { name: 'ix_patientId_bookedAt' });
db.Appointments.createIndex({ doctorId: 1, bookedAt: 1 }, { name: 'ix_doctorId_bookedAt' });
db.Appointments.createIndex({ slotId: 1 }, { unique: true, name: 'ux_slotId' });

createCollectionSafe('Rewards', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patientId', 'specializationId', 'points', 'type', 'source', 'createdAt'],
      properties: {
        patientId: { bsonType: 'objectId' },
        specializationId: { bsonType: 'objectId' },
        points: { bsonType: ['int', 'long'] },
        type: { enum: ['BONUS', 'PENALTY', 'SPEND'] },
        source: {
          bsonType: 'object',
          required: ['type'],
          properties: {
            type: { enum: ['APPOINTMENT', 'PROFILE_BONUS', 'OTHER'] },
            referenceId: { bsonType: ['objectId', 'null'] }
          }
        },
        description: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Rewards.createIndex({ patientId: 1, 'source.referenceId': 1 }, { name: 'ix_patientId_sourceReferenceId' });
db.Rewards.createIndex({ patientId: 1, specializationId: 1 }, { name: 'ix_patientId_specializationId' });

createCollectionSafe('Badges', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'level', 'discountPercentage', 'pointsRequired', 'createdAt'],
      properties: {
        name: { bsonType: 'string' },
        description: { bsonType: ['string', 'null'] },
        imgUrl: { bsonType: ['string', 'null'] },
        level: { bsonType: ['int', 'long'] },
        discountPercentage: { bsonType: ['int', 'long'] },
        pointsRequired: { bsonType: ['int', 'long'] },
        specializationId: { bsonType: ['objectId', 'null'] },
        createdAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Badges.createIndex({ specializationId: 1, level: 1 }, { name: 'ix_specializationId_level' });

createCollectionSafe('Transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['appointmentId', 'patientId', 'monoInvoiceId', 'amount', 'currency', 'status', 'createdAt', 'updatedAt'],
      properties: {
        appointmentId: { bsonType: 'objectId' },
        patientId: { bsonType: 'objectId' },
        monoInvoiceId: { bsonType: 'string' },
        amount: { bsonType: ['double', 'int', 'long', 'decimal'] },
        currency: { bsonType: 'string' },
        status: { enum: ['CREATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REVERSED'] },
        errorMessage: { bsonType: ['string', 'null'] },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.Transactions.createIndex({ monoInvoiceId: 1 }, { unique: true, name: 'ux_monoInvoiceId' });
db.Transactions.createIndex({ appointmentId: 1 }, { name: 'ix_appointmentId' });

createCollectionSafe('PatientProgress', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['patientId', 'specializationId', 'points', 'totalEarnedPoints', 'updatedAt'],
      properties: {
        patientId: { bsonType: 'objectId' },
        specializationId: { bsonType: 'objectId' },
        points: { bsonType: ['int', 'long'] },
        activeBadgeId: { bsonType: ['objectId', 'null'] },
        totalEarnedPoints: { bsonType: ['int', 'long'] },
        updatedAt: { bsonType: 'date' }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

db.PatientProgress.createIndex(
  { patientId: 1, specializationId: 1 },
  { unique: true, name: 'ux_patientId_specializationId' }
);

print('MongoDB collections, validators, and indexes created successfully.');
