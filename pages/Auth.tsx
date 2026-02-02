import React, { useState } from 'react';
import { Login } from './Login';
import { SignupFlow } from './SignupFlow';

type AuthView = 'login' | 'signup';

// Check URL params to determine initial view
const getInitialView = (): AuthView => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    // Show signup if coming from checkout success or signup link
    if (params.get('checkout') === 'success' || params.get('signup') === 'true') {
      return 'signup';
    }
  }
  return 'login';
};

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>(getInitialView);

  if (view === 'signup') {
    return (
      <SignupFlow 
        onSwitchToLogin={() => setView('login')}
        onComplete={() => {
          // After signup completes, user is automatically logged in
          // The AuthProvider will handle the state change
        }}
      />
    );
  }

  return (
    <Login 
      onSwitchToSignup={() => setView('signup')}
    />
  );
};




