// Avyro MongoDB seed script
// Inserts test data for all collections from mongo_setup.js
// Run after schema setup:
//   mongosh "mongodb://localhost:27017/avyro" mongo_setup.js
//   mongosh "mongodb://localhost:27017/avyro" seed.js

db = db.getSiblingDB('avyro');

db.Transactions.deleteMany({});
db.Appointments.deleteMany({});
db.Schedules.deleteMany({});
db.Rewards.deleteMany({});
db.PatientProgress.deleteMany({});
db.Badges.deleteMany({});
db.Users.deleteMany({});
db.Specializations.deleteMany({});

const now = new Date('2026-04-19T12:00:00Z');
const plusMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60000);

const ids = {
  specializations: {
    cardiology: ObjectId('68039a000000000000000001'),
    dermatology: ObjectId('68039a000000000000000002'),
    dentistry: ObjectId('68039a000000000000000003')
  },
  users: {
    doctorAnna: ObjectId('68039a000000000000000101'),
    doctorOleksii: ObjectId('68039a000000000000000102'),
    patientMaksym: ObjectId('68039a000000000000000201'),
    patientIryna: ObjectId('68039a000000000000000202')
  },
  schedules: {
    annaWeekly: ObjectId('68039a000000000000000301'),
    oleksiiCustom: ObjectId('68039a000000000000000302')
  },
  badges: {
    cardioBronze: ObjectId('68039a000000000000000501'),
    cardioSilver: ObjectId('68039a000000000000000502'),
    globalWelcome: ObjectId('68039a000000000000000503')
  },
  appointments: {
    planned: ObjectId('68039a000000000000000601'),
    completed: ObjectId('68039a000000000000000602')
  },
  rewards: {
    profileBonus: ObjectId('68039a000000000000000701'),
    appointmentBonus: ObjectId('68039a000000000000000702'),
    pointsSpend: ObjectId('68039a000000000000000703')
  },
  transactions: {
    txSuccess: ObjectId('68039a000000000000000801'),
    txProcessing: ObjectId('68039a000000000000000802')
  },
  patientProgress: {
    maksymCardio: ObjectId('68039a000000000000000901'),
    irynaDerm: ObjectId('68039a000000000000000902')
  }
};

// Base datetimes for / appointments
const slotAnna0900From = new Date('2026-04-22T09:00:00Z');
const slotAnna0930From = new Date('2026-04-22T09:30:00Z');
const slotAnna1000From = new Date('2026-04-22T10:00:00Z');
const slotOleksii1100From = new Date('2026-04-23T11:00:00Z');
const slotOleksii1130From = new Date('2026-04-23T11:30:00Z');

// 1) Specializations
db.Specializations.insertMany([
  {
    _id: ids.specializations.cardiology,
    name: 'Cardiology',
    description: 'Diagnosis and treatment of cardiovascular diseases.',
    createdAt: now
  },
  {
    _id: ids.specializations.dermatology,
    name: 'Dermatology',
    description: 'Consultations for skin, hair, and nail conditions.',
    createdAt: now
  },
  {
    _id: ids.specializations.dentistry,
    name: 'Dentistry',
    description: 'Dental examination, treatment, and prevention.',
    createdAt: now
  }
]);

// 2) Users
db.Users.insertMany([
  {
    _id: ids.users.doctorAnna,
    email: 'anna.kovalenko@avyro.test',
    password: 'hashed_password_doctor_anna',
    role: 'DOCTOR',
    isActive: true,
    profile: {
      fullName: 'Anna Kovalenko',
      phone: '+380671110001',
      specializationId: ids.specializations.cardiology,
      avatarUrl: 'https://example.com/avatars/anna-kovalenko.png'
    },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: new Date('2026-04-19T09:15:00Z'),
    deletedAt: null
  },
  {
    _id: ids.users.doctorOleksii,
    email: 'oleksii.melnyk@avyro.test',
    password: 'hashed_password_doctor_oleksii',
    role: 'DOCTOR',
    isActive: true,
    profile: {
      fullName: 'Oleksii Melnyk',
      phone: '+380671110002',
      specializationId: ids.specializations.dermatology,
      avatarUrl: 'https://example.com/avatars/oleksii-melnyk.png'
    },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: new Date('2026-04-18T14:40:00Z'),
    deletedAt: null
  },
  {
    _id: ids.users.patientMaksym,
    email: 'maksym.bondar@avyro.test',
    password: 'hashed_password_patient_maksym',
    role: 'PATIENT',
    isActive: true,
    profile: {
      fullName: 'Maksym Bondar',
      phone: '+380671110003',
      specializationId: null,
      avatarUrl: null
    },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: new Date('2026-04-19T10:05:00Z'),
    deletedAt: null
  },
  {
    _id: ids.users.patientIryna,
    email: 'iryna.shevchenko@avyro.test',
    password: 'hashed_password_patient_iryna',
    role: 'PATIENT',
    isActive: true,
    profile: {
      fullName: 'Iryna Shevchenko',
      phone: '+380671110004',
      specializationId: null,
      avatarUrl: 'https://example.com/avatars/iryna-shevchenko.png'
    },
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    deletedAt: null
  }
]);

// 3) Schedules
db.Schedules.insertMany([
  {
    _id: ids.schedules.annaWeekly,
    doctorId: ids.users.doctorAnna,
    title: 'Anna Kovalenko weekly cardiology schedule',
    isRepeated: true,
    repeating: {
      type: 'WEEKLY',
      daysOfWeek: [1, 3, 5],
      startTime: '09:00',
      endTime: '12:00',
      slotDuration: NumberInt(30),
      timezone: 'Europe/Kyiv'
    },
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.schedules.oleksiiCustom,
    doctorId: ids.users.doctorOleksii,
    title: 'Oleksii Melnyk custom dermatology session',
    isRepeated: false,
    repeating: {
      type: 'CUSTOM',
      daysOfWeek: null,
      startTime: '11:00',
      endTime: '12:00',
      slotDuration: NumberInt(30),
      timezone: 'Europe/Kyiv'
    },
    createdAt: now,
    updatedAt: now
  }
]);

// 4) Badges
db.Badges.insertMany([
  {
    _id: ids.badges.cardioBronze,
    name: 'Cardio Bronze',
    description: 'Starter badge for active cardiology patients.',
    imgUrl: 'https://example.com/badges/cardio-bronze.png',
    level: NumberInt(1),
    discountPercentage: NumberInt(5),
    pointsRequired: NumberInt(100),
    specializationId: ids.specializations.cardiology,
    createdAt: now
  },
  {
    _id: ids.badges.cardioSilver,
    name: 'Cardio Silver',
    description: 'Advanced cardiology badge with a higher discount.',
    imgUrl: 'https://example.com/badges/cardio-silver.png',
    level: NumberInt(2),
    discountPercentage: NumberInt(10),
    pointsRequired: NumberInt(250),
    specializationId: ids.specializations.cardiology,
    createdAt: now
  },
  {
    _id: ids.badges.globalWelcome,
    name: 'Welcome Badge',
    description: 'Universal onboarding badge for any patient.',
    imgUrl: null,
    level: NumberInt(1),
    discountPercentage: NumberInt(3),
    pointsRequired: NumberInt(50),
    specializationId: null,
    createdAt: now
  }
]);

// 5) Slots (insert one booked slot with appointmentId null first, then update it later)
db.Slots.insertMany([
  {
    _id: ids.slots.anna0900,
    scheduleId: ids.schedules.annaWeekly,
    doctorId: ids.users.doctorAnna,
    from: slotAnna0900From,
    to: plusMinutes(slotAnna0900From, 30),
    type: 'AVAILABLE',
    appointmentId: null,
    createdAt: now
  },
  {
    _id: ids.slots.anna0930,
    scheduleId: ids.schedules.annaWeekly,
    doctorId: ids.users.doctorAnna,
    from: slotAnna0930From,
    to: plusMinutes(slotAnna0930From, 30),
    type: 'AVAILABLE',
    appointmentId: null,
    createdAt: now
  },
  {
    _id: ids.slots.anna1000Blocked,
    scheduleId: ids.schedules.annaWeekly,
    doctorId: ids.users.doctorAnna,
    from: slotAnna1000From,
    to: plusMinutes(slotAnna1000From, 30),
    type: 'BLOCKED',
    appointmentId: null,
    createdAt: now
  },
  {
    _id: ids.slots.oleksii1100,
    scheduleId: ids.schedules.oleksiiCustom,
    doctorId: ids.users.doctorOleksii,
    from: slotOleksii1100From,
    to: plusMinutes(slotOleksii1100From, 30),
    type: 'AVAILABLE',
    appointmentId: null,
    createdAt: now
  },
  {
    _id: ids.slots.oleksii1130,
    scheduleId: ids.schedules.oleksiiCustom,
    doctorId: ids.users.doctorOleksii,
    from: slotOleksii1130From,
    to: plusMinutes(slotOleksii1130From, 30),
    type: 'AVAILABLE',
    appointmentId: null,
    createdAt: now
  }
]);

// 6) Appointments
db.Appointments.insertMany([
  {
    _id: ids.appointments.planned,
    patientId: ids.users.patientMaksym,
    doctorId: ids.users.doctorAnna,
    slotId: ids.slots.anna0900,
    status: 'PLANNED',
    paymentStatus: 'PENDING',
    basePrice: 1200,
    appliedBadgeId: ids.badges.globalWelcome,
    discountAmount: 36,
    finalPrice: 1164,
    appointmentType: 'ONLINE_CONSULTATION',
    bookedAt: new Date('2026-04-19T10:30:00Z'),
    completedAt: null,
    cancelledAt: null,
    cancelReason: null,
    notes: 'Initial cardiology consultation for chest discomfort.',
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ids.appointments.completed,
    patientId: ids.users.patientIryna,
    doctorId: ids.users.doctorOleksii,
    slotId: ids.slots.oleksii1100,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    basePrice: 900,
    appliedBadgeId: null,
    discountAmount: null,
    finalPrice: 900,
    appointmentType: 'OFFLINE_VISIT',
    bookedAt: new Date('2026-04-15T08:30:00Z'),
    completedAt: new Date('2026-04-23T11:35:00Z'),
    cancelledAt: null,
    cancelReason: null,
    notes: 'Follow-up dermatology visit with treatment recommendations.',
    createdAt: new Date('2026-04-15T08:30:00Z'),
    updatedAt: new Date('2026-04-23T11:35:00Z')
  }
]);

// Link booked slots back to appointments
db.Slots.updateOne(
  { _id: ids.slots.anna0900 },
  { $set: { appointmentId: ids.appointments.planned } }
);

db.Slots.updateOne(
  { _id: ids.slots.oleksii1100 },
  { $set: { appointmentId: ids.appointments.completed } }
);

// 7) Rewards
db.Rewards.insertMany([
  {
    _id: ids.rewards.profileBonus,
    patientId: ids.users.patientMaksym,
    specializationId: ids.specializations.cardiology,
    points: NumberInt(50),
    type: 'BONUS',
    source: {
      type: 'PROFILE_BONUS',
      referenceId: null
    },
    description: 'Bonus for completing patient profile.',
    createdAt: new Date('2026-04-19T10:10:00Z')
  },
  {
    _id: ids.rewards.appointmentBonus,
    patientId: ids.users.patientIryna,
    specializationId: ids.specializations.dermatology,
    points: NumberInt(100),
    type: 'BONUS',
    source: {
      type: 'APPOINTMENT',
      referenceId: ids.appointments.completed
    },
    description: 'Points awarded for completed dermatology appointment.',
    createdAt: new Date('2026-04-23T11:40:00Z')
  },
  {
    _id: ids.rewards.pointsSpend,
    patientId: ids.users.patientMaksym,
    specializationId: ids.specializations.cardiology,
    points: NumberInt(36),
    type: 'SPEND',
    source: {
      type: 'OTHER',
      referenceId: ids.appointments.planned
    },
    description: 'Points spent via Welcome Badge discount.',
    createdAt: new Date('2026-04-19T10:31:00Z')
  }
]);

// 8) Transactions
db.Transactions.insertMany([
  {
    _id: ids.transactions.txSuccess,
    appointmentId: ids.appointments.completed,
    patientId: ids.users.patientIryna,
    monoInvoiceId: 'mono_inv_avyro_0001',
    amount: 900,
    currency: 'UAH',
    status: 'SUCCESS',
    errorMessage: null,
    createdAt: new Date('2026-04-23T10:45:00Z'),
    updatedAt: new Date('2026-04-23T11:36:00Z')
  },
  {
    _id: ids.transactions.txProcessing,
    appointmentId: ids.appointments.planned,
    patientId: ids.users.patientMaksym,
    monoInvoiceId: 'mono_inv_avyro_0002',
    amount: 1164,
    currency: 'UAH',
    status: 'PROCESSING',
    errorMessage: null,
    createdAt: new Date('2026-04-19T10:32:00Z'),
    updatedAt: new Date('2026-04-19T10:32:00Z')
  }
]);

// 9) PatientProgress
db.PatientProgress.insertMany([
  {
    _id: ids.patientProgress.maksymCardio,
    patientId: ids.users.patientMaksym,
    specializationId: ids.specializations.cardiology,
    points: NumberInt(14),
    activeBadgeId: ids.badges.globalWelcome,
    totalEarnedPoints: NumberInt(50),
    updatedAt: now
  },
  {
    _id: ids.patientProgress.irynaDerm,
    patientId: ids.users.patientIryna,
    specializationId: ids.specializations.dermatology,
    points: NumberInt(100),
    activeBadgeId: null,
    totalEarnedPoints: NumberInt(100),
    updatedAt: new Date('2026-04-23T11:40:00Z')
  }
]);

print('Seed data inserted successfully for all Avyro collections.');
printjson({
  insertedCollections: [
    'Specializations',
    'Users',
    'Schedules',
    'Badges',
    'Slots',
    'Appointments',
    'Rewards',
    'Transactions',
    'PatientProgress'
  ]
});
