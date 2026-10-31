#!/bin/bash
echo "Waiting for mongod to start..."
mongosh --quiet --eval "
try {
  const status = rs.status();
  if (status.ok) {
    console.log('Replica set rs0 already initiated.');
  }
} catch (e) {
  console.log('Initiating replica set rs0...');
  rs.initiate({
    _id: 'rs0',
    members: [{ _id: 0, host: 'mongo:27017' }]
  });
  console.log('Replica set rs0 initiated successfully.');
}
"
