import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { FaCut } from 'react-icons/fa';

const Waitlist = () => {
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hairdresser, setHairdresser] = useState({ initials: 'AB' }); // Hairdresser initials
  const CUT_DURATION = 20 * 60 * 1000; // 20 minutes in milliseconds

  useEffect(() => {
    const fetchQueue = () => {
      axios.get('https://api.sundestova.no/queue')
        .then(response => setQueue(response.data))
        .catch(console.error);
    };
    
    fetchQueue();
    const queueInterval = setInterval(fetchQueue, 40000); // Fetch every 40 seconds
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000); // Update current time every second

    return () => {
      clearInterval(queueInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Calculate dynamic waiting times
  const calculateWaitingTimes = () => {
    let accumulatedTime = 0;
    return queue.map((client, index) => {
      if (index === 0 && client.status === 'in-progress') {
        // Live countdown for the client currently being cut
        const elapsedTime = Math.floor((currentTime - new Date(client.startTime)) / 1000);
        const remainingTime = Math.max(CUT_DURATION / 1000 - elapsedTime, 0);
        accumulatedTime = remainingTime; // Set base time for the next client
        return { ...client, waitingTime: `${Math.floor(remainingTime / 60)} min ${remainingTime % 60} sec` };
      } else {
        // Calculate waiting time based on accumulated time
        accumulatedTime += CUT_DURATION / 1000; // Add 20 minutes for each client in line
        return { ...client, waitingTime: `${Math.floor(accumulatedTime / 60)} min` };
      }
    });
  };

  const displayQueue = calculateWaitingTimes();

  return (
    <div className="waitlist-container">
      <header className="header">
        <h1 className="title">Cipher Salong</h1>
        <h2 className="subtitle">Venteliste</h2>
        <p className="date-time">
          {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
        </p>
      </header>
      
      <div className="main-content">
        <div className="queue">
          {displayQueue.map((client, index) => (
            <div key={client._id} className={`queue-item ${client.status === 'in-progress' ? 'active' : ''}`}>
              <div className="queue-position">
                <div className={`status-dot ${client.status === 'in-progress' ? 'active-dot' : 'waiting-dot'}`}></div>
              </div>
              <div className="queue-info">
                <p className="client-name">
                  {client.name}
                  {client.status === 'in-progress' && <FaCut className="scissor-icon" />}
                </p>
                <p className="client-wait-time">{client.waitingTime}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="estimated-waiting-time">
          <h3>Est. Waiting Time</h3>
          <p>{displayQueue.length > 0 ? displayQueue[displayQueue.length - 1].waitingTime : 'No clients'}</p>
          <p className="live-clock">{currentTime.toLocaleTimeString()}</p> {/* Live clock under waiting time */}
        </div>
      </div>

      <footer className="footer">
        <div className="hairdresser">
          <div className="initials-circle">{hairdresser.initials}</div>
          <p>På vakt</p>
        </div>
      </footer>
    </div>
  );
};

export default Waitlist;
