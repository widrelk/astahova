import React from "react";
import logo from './logo.svg';
import './App.css';
import Lab1 from './labs/Lab1';
import { useState } from 'react';

const labs = {
  "Lab1": require('./labs/Lab1')
}

function App() {


  const [labContent, setLabContent] = useState(<p>Выберете лабораторную работу из списка</p>)
  
  const handleChangeContent = (button) => {
    setLabContent(<Lab1/>)
  }

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
      <div style={{display:"flex"}}>
          <div style={{flex: 1, float: "left", border:"1px solid"}}>
            <button id={"btnLab1"} onClick={ () => handleChangeContent("Lab1") }>Лабораторная работа 1</button>
          </div>
          <div style={{flex: 5, float: "left"}}>
              {labContent}
          </div>
        </div>
    </div>
  );
}

export default App;
