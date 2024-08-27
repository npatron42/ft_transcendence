import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [details, setDetails] = useState([]);

  // Fonction pour récupérer les données depuis le backend
  const printDataFromBackend = () => {
    axios.get(import.meta.env.VITE_API_URL)
      .then(res => {
        setDetails(res.data); // Mise à jour de l'état avec les données reçues
      })
      .catch(err => {
        console.error(err); // Gestion des erreurs éventuelles
      });
  }

  // Utilisation de useEffect pour appeler la fonction lors du montage du composant
  useEffect(() => {
    printDataFromBackend();
  }, []); // Le tableau vide [] signifie que l'effet ne se produit que lors du montage

  return (
    <div>
      <p>Hello Django!</p>
      <hr />
      {details.map((output, id) => (
        <div key={id}>
          <h2>{output.username}</h2>
          <h2>{output.email}</h2>
          <h2>{output.password}</h2>
        </div>
      ))}
    </div>
  );
}

export default App;
