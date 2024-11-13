const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MongoDB connection using an environment variable for the URI
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let appointmentCollection;
let historyCollection;

// Connect to MongoDB
client.connect().then(() => {
  const db = client.db('salonQueue');
  appointmentCollection = db.collection('appointments');
  historyCollection = db.collection('history');
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB:", err);
});

// Endpoint to book an appointment
app.post('/book', async (req, res) => {
  const { name, email, phone } = req.body;
  const newAppointment = {
    name,
    email,
    phone,
    status: 'waiting',
    startTime: null,
  };
  await appointmentCollection.insertOne(newAppointment);
  res.json({ message: 'Appointment booked successfully' });
});

// Endpoint to get the waiting list
app.get('/queue', async (req, res) => {
  const queue = await appointmentCollection.find({ status: { $in: ['waiting', 'in-progress'] } }).toArray();
  res.json(queue);
});

// Admin endpoint to start a haircut
app.post('/admin/start', async (req, res) => {
  const { id } = req.body;
  const startTime = new Date();
  await appointmentCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'in-progress', startTime } });
  res.json({ message: 'Haircut started' });
});

// Admin endpoint to stop a haircut
app.post('/admin/stop', async (req, res) => {
  const { id } = req.body;
  const appointment = await appointmentCollection.findOne({ _id: new ObjectId(id) });
  if (appointment) {
    await historyCollection.insertOne({ ...appointment, status: 'completed' });
    await appointmentCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Haircut stopped and archived' });
  } else {
    res.status(404).json({ message: 'Appointment not found' });
  }
});

app.listen(PORT, () => console.log(`Backend is running on port ${PORT}`));
