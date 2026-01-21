import React, { useState } from 'react';
import HomePage from '../Screens/HomePage';
import ContactConfirmation from '../Screens/ContactUsConfirmationPage';
const Navigator = () => {
  const [screen, setScreen] = useState('Contact');

  // Simple logic to switch between screens
  switch (screen) {
    case 'Home':
      return <HomePage />;
    case 'Success':
      return <ContactConfirmation onGoHome={() => setScreen('Home')} />;
  }
};

export default Navigator;
