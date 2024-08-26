import { useState, useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {

  const printName = () => {
    const names = ["Nico", "Ilyes", "Fabio"];
    const choice = Math.floor(Math.random() * 3)

    return (names[choice])
  }

  return (
    <div>
      <p>
        Hello {printName()}
      </p>
    </div>
  )
}

export default App
