// 007_feedback.js
// Create/update Feedbacks and DoctorReviews collections from current dev feedback_module entities.
// Based on:
// - modules/feedback_module/domains/Feedback.py
// - modules/feedback_module/domains/DoctorReview.py
// - FeedbackRepository uses db["Feedbacks"] and db["DoctorReviews"].

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

function copyMissingDocs(sourceName, targetName) {
  if (!avyroDb.getCollectionNames().includes(sourceName)) return;
  if (sourceName === targetName) return;
  print('Legacy collection found: ' + sourceName + '. Copying missing docs into ' + targetName + '.');
  avyroDb[sourceName].find().forEach(function(doc) {
    if (!avyroDb[targetName].findOne({ _id: doc._id })) {
      avyroDb[targetName].insertOne(doc);
    }
  });
}

print('Starting migration 007: Feedbacks + DoctorReviews');

// Backend uses Feedbacks and DoctorReviews. Copy possible legacy naming variants if they exist.
if (!avyroDb.getCollectionNames().includes('Feedbacks')) {
  avyroDb.createCollection('Feedbacks');
  print('Created collection: Feedbacks');
}
if (!avyroDb.getCollectionNames().includes('DoctorReviews')) {
  avyroDb.createCollection('DoctorReviews');
  print('Created collection: DoctorReviews');
}
copyMissingDocs('Feedback', 'Feedbacks');
copyMissingDocs('feedback', 'Feedbacks');
copyMissingDocs('feedbacks', 'Feedbacks');
copyMissingDocs('DoctorReview', 'DoctorReviews');
copyMissingDocs('doctor_reviews', 'DoctorReviews');
copyMissingDocs('doctorReviews', 'DoctorReviews');

// Normalize Feedbacks fields to current domain/repository format:
// user_id, message, rating, created_at.
avyroDb.Feedbacks.find().forEach(function(feedback) {
  var set = {};
  var unset = {};

  if (feedback.user_id === undefined && feedback.userId !== undefined) {
    set.user_id = feedback.userId;
    unset.userId = '';
  }
  if (feedback.message === undefined) {
    if (feedback.text !== undefined) set.message = String(feedback.text);
    else if (feedback.comment !== undefined) set.message = String(feedback.comment);
  }
  if (feedback.rating === undefined) set.rating = null;
  if (feedback.rating !== undefined && feedback.rating !== null) {
    var r = Number(feedback.rating);
    if (!isNaN(r) && r >= 1 && r <= 5) set.rating = r;
  }
  if (feedback.created_at === undefined) {
    set.created_at = feedback.createdAt || feedback.sent_at || now;
  }
  if (Object.keys(set).length > 0 || Object.keys(unset).length > 0) {
    var update = {};
    if (Object.keys(set).length > 0) update.$set = set;
    if (Object.keys(unset).length > 0) update.$unset = unset;
    avyroDb.Feedbacks.updateOne({ _id: feedback._id }, update);
  }
});

// Normalize DoctorReviews fields to current domain/repository format:
// doctor_id, patient_id, message, rating, visibility, created_at.
avyroDb.DoctorReviews.find().forEach(function(review) {
  var set = {};
  var unset = {};

  if (review.doctor_id === undefined && review.doctorId !== undefined) {
    set.doctor_id = review.doctorId;
    unset.doctorId = '';
  }
  if (review.patient_id === undefined && review.patientId !== undefined) {
    set.patient_id = review.patientId;
    unset.patientId = '';
  }
  if (review.message === undefined) {
    if (review.text !== undefined) set.message = String(review.text);
    else if (review.comment !== undefined) set.message = String(review.comment);
  }
  if (review.rating !== undefined && review.rating !== null) {
    var rr = Number(review.rating);
    if (!isNaN(rr) && rr >= 1 && rr <= 5) set.rating = rr;
  }
  if (review.visibility === undefined || review.visibility === null || ['PUBLIC', 'ANONYMOUS'].indexOf(review.visibility) === -1) {
    set.visibility = 'PUBLIC';
  }
  if (review.created_at === undefined) {
    set.created_at = review.createdAt || now;
  }
  if (Object.keys(set).length > 0 || Object.keys(unset).length > 0) {
    var update = {};
    if (Object.keys(set).length > 0) update.$set = set;
    if (Object.keys(unset).length > 0) update.$unset = unset;
    avyroDb.DoctorReviews.updateOne({ _id: review._id }, update);
  }
});

createOrUpdateCollection('Feedbacks', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['user_id', 'message', 'created_at'],
    properties: {
      user_id: { bsonType: ['objectId', 'string'] },
      message: { bsonType: 'string' },
      rating: { bsonType: ['int', 'long', 'double', 'null'], minimum: 1, maximum: 5 },
      created_at: { bsonType: ['date', 'string'] }
    }
  }
});

createOrUpdateCollection('DoctorReviews', {
  $jsonSchema: {
    bsonType: 'object',
    required: ['doctor_id', 'patient_id', 'message', 'rating', 'visibility', 'created_at'],
    properties: {
      doctor_id: { bsonType: ['objectId', 'string'] },
      patient_id: { bsonType: ['objectId', 'string'] },
      message: { bsonType: 'string' },
      rating: { bsonType: ['int', 'long', 'double'], minimum: 1, maximum: 5 },
      visibility: { enum: ['PUBLIC', 'ANONYMOUS'] },
      created_at: { bsonType: ['date', 'string'] }
    }
  }
});

safeIndex('Feedbacks', { user_id: 1, created_at: -1 }, { name: 'ix_user_id_created_at' });
safeIndex('Feedbacks', { rating: 1 }, { name: 'ix_feedback_rating' });
safeIndex('DoctorReviews', { doctor_id: 1, created_at: -1 }, { name: 'ix_doctor_id_created_at' });
safeIndex('DoctorReviews', { patient_id: 1 }, { name: 'ix_patient_id' });
safeIndex('DoctorReviews', { doctor_id: 1, patient_id: 1 }, { name: 'ix_doctor_patient' });

print('Migration 007 completed.');
