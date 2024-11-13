import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const Booking = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const bookAppointment = () => {
    const token = localStorage.getItem('token'); // Retrieve token from local storage
    axios.post('https://api.sundestova.no/book', { name, email, phone })
      .then(response => alert('Appointment booked successfully'))
      .catch(error => alert('Failed to book appointment'));
  };

  return (
    <div className="container">
      <h1>Book an Appointment</h1>
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <button onClick={bookAppointment}>Book</button>
    </div>
  );
};

export default Booking;
