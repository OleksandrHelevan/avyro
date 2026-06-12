db = db.getSiblingDB('avyro');

print("Starting migration: Updating notes validator to allow array...");

db.runCommand({
  collMod: "Appointments",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      properties: {
        notes: {
          bsonType: ["array", "null"],
          description: "notes must be an array or null"
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
});

print("Migration completed successfully.");
