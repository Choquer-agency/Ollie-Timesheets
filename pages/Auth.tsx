import React, { useState } from 'react';
import { Login } from './Login';
import { SignupFlow } from './SignupFlow';

type AuthView = 'login' | 'signup';

export const Auth: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

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

