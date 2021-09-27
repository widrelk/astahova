import React from "react"
import logo from './logo.svg'
import './App.css'
import { useState } from 'react'

import Lab1 from "./labs/Lab1"
import Lab2 from "./labs/Lab2"
import Lab3 from "./labs/Lab3"

function App() {
  const [lab2result, setLabResult] = useState(null)
  const [labContent, setLabContent] = useState(<p>Выберете лабораторную работу из списка</p>)
  
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <h2>Основы экономики программной инженерии и управление проектами</h2>
      <div style={{display:"flex",marginBottom:"60px"}}>
          <div style={{flex: 1, float: "left", border:"1px solid", minHeight:"300px"}}>
            <button id={"btnLab1"} onClick={ () => setLabContent(<Lab1/>) }>Лабораторная работа 1</button>
            <button id={"btnLab2"} onClick={ () => setLabContent(<Lab2 setResult={setLabResult}/>) }>Лабораторная работа 2</button>
            <button id={"btnLab3"} onClick={ () => setLabContent(<Lab3 initData={lab2result}/>) }>Лабораторная работа 3</button>
          </div>
          <div style={{flex: 5, float: "left", paddingLeft:"15px"}}>
              {labContent}
          </div>
        </div>
    </div>
  );
}

export default App;
