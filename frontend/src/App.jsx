import container from './Tess';
import './App.css'
import React, { useState } from 'react';
import axios from 'axios';
import Container from './Tess';
import Tess from './Tess';

function App(){
  return (
      <div>
        <Tess />
      </div>
  )
}
// function App() {
//   const [data, setData] = useState({
//     username: '',
//     email: '',
//     password: ''
//   });

//   <div>
//     <h1>oui</h1>
//   </div>

//   const handleChange = (e) => {
//     setData({
//       ...data,
//     });
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   try {
//   //     const response = await axios.post('http://localhost:8000/api/create/', data, {
//   //       headers: {
//   //         'Content-Type': 'application/json'
//   //       }
//   //     });
//   //     console.log('Response:', response.data);
//   //   } catch (error) {
//   //     console.error('Error during the POST request:', error);
//   //   }
//   // };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.get('https://jsonplaceholder.typicode.com/users', {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//       console.log('Response:', response.data);
//     } catch (error) {
//       console.error('Error during the POST request:', error);
//     }
//   };

//   return (
//     <div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           name="username"
//           value={data.username}
//           onChange={handleChange}
//           placeholder="Username"
//         />
//         <input
//           type="text"
//           name="Looser"
//           value={data.password}
//           onChange={handleChange}
//           placeholder="Password"
//         />
//         <input
//           type="text"
//           name="email"
//           value={data.email}
//           onChange={handleChange}
//           placeholder="Email"
//         />
//         <button type="submit">Submit</button>
//       </form>
//     </div>
//   );

//   // fonction App(){
//   //   return(
//   //     <div>
//   //     </div>
//   //   )
//   // }

// }

export default App;
