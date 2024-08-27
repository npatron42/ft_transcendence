import './App.css'
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
      // [date_subscription]: '2004-16-08',
      // [date_lastvisit]: '2004-16-08',
      // [friend]: '2004-16-08',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/create/', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error during the POST request:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={data.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          type="text"
          name="password"
          value={data.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <input
          type="text"
          name="email"
          value={data.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
