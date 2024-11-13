import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const Admin = () => {
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hairdresser, setHairdresser] = useState({ initials: 'AB' }); // Placeholder initials for hairdresser

  useEffect(() => {
    const fetchQueue = () => {
      axios.get('https://api.sundestova.no/queue')
        .then(response => setQueue(response.data))
        .catch(console.error);
    };
    
    fetchQueue();
    const interval = setInterval(fetchQueue, 40000); // Fetch every 40 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000); // Update current time every second

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const startCut = (id) => {
    axios.post('https://api.sundestova.no/admin/start', { id })
      .then(() => setQueue(prevQueue => 
        prevQueue.map(client => client._id === id ? { ...client, status: 'in-progress' } : client)
      ))
      .catch(console.error);
  };

  const stopCut = (id) => {
    axios.post('https://api.sundestova.no/admin/stop', { id })
      .then(() => setQueue(prevQueue => prevQueue.filter(client => client._id !== id)))
      .catch(console.error);
  };

  return (
    <div className="admin-container">
      <header className="header">
        <h1 className="title">Cipher Salon - Admin Panel</h1>
        <p className="date-time">
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </p>
      </header>
      <div className="queue">
        {queue.map((client, index) => (
          <div key={client._id} className={`queue-item ${client.status === 'in-progress' ? 'active' : ''}`}>
            <div className="queue-position">
              <div className="circle">{index + 1}</div>
            </div>
            <div className="queue-info">
              <p className="client-name">{client.name}</p>
              <p className="client-status">{client.status === 'in-progress' ? 'In Progress' : 'Waiting'}</p>
            </div>
            <div className="admin-controls">
              {client.status === 'waiting' ? (
                <button onClick={() => startCut(client._id)} className="start-button">Start</button>
              ) : (
                <button onClick={() => stopCut(client._id)} className="stop-button">Stop</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <footer className="footer">
        <div className="hairdresser">
          <div className="initials-circle">{hairdresser.initials}</div>
          <p>On Duty</p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
