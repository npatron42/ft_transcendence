import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value // Mise à jour du champ modifié
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    const jsonData = {
      "username": "fpalumbo",
      "password": "qwd",
      // "email": "test@hotmail.fr",
      // "date_subscription": "2024-08-28T14:00:00Z",
      // "date_lastvisit": "2024-09-01T10:30:00Z",
    };

    try {
      const response = await axios.post('http://localhost:8000/api/token/', jsonData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Réponse:', response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* <input 
          type="text" 
          name="username" 
          value={data.username} 
          onChange={handleChange} 
          placeholder="Username"
        />
        <input 
          type="email" 
          name="email" 
          value={data.email} 
          onChange={handleChange} 
          placeholder="Email"
        />
        <input 
          type="password" 
          name="password" 
          value={data.password} 
          onChange={handleChange} 
          placeholder="Password"
        /> */}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
