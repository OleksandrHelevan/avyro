db = db.getSiblingDB("avyro");

// optional: очистка (тільки для dev)
db.users.drop();

db.users.insertMany([
  {
    name: "Oleksandr",
    role: "admin",
    createdAt: new Date()
  },
  {
    name: "Test User",
    role: "user",
    createdAt: new Date()
  }
]);

db.products.insertMany([
  {
    title: "Product 1",
    price: 100
  },
  {
    title: "Product 2",
    price: 200
  }
]);
