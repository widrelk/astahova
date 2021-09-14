import React from "react";
import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

import Lab1 from "./labs/Lab1";
import Lab2 from "./labs/Lab2";

function App() {


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
      <div style={{display:"flex"}}>
          <div style={{flex: 1, float: "left", border:"1px solid", minHeight:"300px"}}>
            <button id={"btnLab1"} onClick={ () => setLabContent(<Lab1/>) }>Лабораторная работа 1</button>
            <button id={"btnLab2"} onClick={ () => setLabContent(<Lab2/>) }>Лабораторная работа 2</button>
          </div>
          <div style={{flex: 5, float: "left", paddingLeft:"15px"}}>
              {labContent}
          </div>
        </div>
    </div>
  );
}

export default App;
