const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.9br6gai.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
export const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

export const connectDB = async () => {
  await client.connect();
};

export const insertDoc = async (dataBaseName, collection, insertedData) => {
  const db = client.db(dataBaseName);

  return db.collection(collection).insertOne(insertedData);
};

export const closeDB = () => {
  client.close();
};

export const getCollectionItem = async (dataBaseName, collection, finder = {}, projection = {}) => {
  const db = client.db(dataBaseName);

  return db.collection(collection)
    .find(finder, projection)
    .sort({ _id: -1 })
    .toArray();
};

export const updateItem = async (dataBaseName, collection, finder = {}, operation = {}) => {
  const db = client.db(dataBaseName);

  return await db.collection(collection)
    .findOneAndUpdate(finder, operation, { returnDocument: 'after' })
};