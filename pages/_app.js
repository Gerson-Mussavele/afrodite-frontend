// pages/_app.js
import { useEffect } from 'react';
import fetch from 'cross-fetch';
import { AuthProvider } from './authContext';

const MyApp = ({ Component, pageProps }) => {
  useEffect(() => {
    // Configura o uso de cookies em todas as solicitações
    fetch.defaults = {
      ...fetch.defaults,
      credentials: 'include',
    };
  }, []);

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
};

export default MyApp;
