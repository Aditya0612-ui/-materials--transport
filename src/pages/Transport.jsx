import React from 'react';
import TransportProvider from '../context/TransportContext';
import TransportSystem from '../components/transport/TransportSystem';

const Transport = () => {
  return (
    <TransportProvider>
      <TransportSystem />
    </TransportProvider>
  );
};

export default Transport;
