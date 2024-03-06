// LoginPage.js
import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/router'
import { useState } from 'react';
import fetch from 'isomorphic-unfetch';
import { useAuth } from './authContext';

const LoginPage = () => {
  const router = useRouter();
  const {setAuthUser, user} = useAuth()
  const { fetchUserStatus } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: 'include', // Inclui cookies na solicitação
        body: new URLSearchParams({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // console.log(data)
        
        console.log('Login bem-sucedido!');
       
        localStorage.setItem('accessToken', data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.tokens.refreshToken);
        // console.log(auth)
        setAuthUser({authenticated: true, username: username, 'user_id': data["user_id"]})
        // console.log(user)
        router.push('/Order');
      } else {
        // Tratar erro de autenticação
        console.error('Erro de autenticação');
      }
    } catch (error) {
      console.error('Erro ao fazer login', error);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Página de Login</h2>
      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Usuário:</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Senha:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={handleLogin}>Login</button>
      </form>
      <style jsx global>{`
        body {
          background: url('/img/LOGO.jpg') no-repeat center center fixed; /* Substitua 'cerveja.jpg' pelo nome da sua imagem */
          background-size: cover;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
