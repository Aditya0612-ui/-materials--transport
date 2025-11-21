// src/components/common/FirebaseStatus.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { database, ref, onValue, off } from '../../config/firebase';

const FirebaseStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    // Monitor Firebase connection status
    const connectedRef = ref(database, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val();
      setIsConnected(connected);
      if (connected) {
        setLastSync(new Date());
      }
    });

    return () => off(connectedRef, 'value', unsubscribe);
  }, []);

  const getStatusColor = () => {
    return isConnected ? 'success' : 'danger';
  };

  const getStatusIcon = () => {
    return isConnected ? '🟢' : '🔴';
  };

  const getStatusText = () => {
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const formatLastSync = () => {
    if (!lastSync) return 'Never';
    return lastSync.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const tooltip = (
    <Tooltip>
      <div>
        <strong>Firebase Status:</strong> {getStatusText()}<br/>
        <strong>Last Sync:</strong> {formatLastSync()}<br/>
        <strong>Database:</strong> Realtime Database<br/>
        <small>Real-time data synchronization {isConnected ? 'active' : 'inactive'}</small>
      </div>
    </Tooltip>
  );

  return (
    <OverlayTrigger placement="bottom" overlay={tooltip}>
      <Badge 
        bg={getStatusColor()} 
        className="d-flex align-items-center gap-1"
        style={{ cursor: 'pointer', fontSize: '0.75rem' }}
      >
        <span>{getStatusIcon()}</span>
        <span>Firebase</span>
        {isConnected && (
          <div 
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'white',
              animation: 'pulse 2s infinite'
            }}
          />
        )}
      </Badge>
    </OverlayTrigger>
  );
};

export default FirebaseStatus;
