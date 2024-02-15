import logo from './logo.svg';
import './App.css';
import WebSocketComponent from './components/ws';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <WebSocketComponent />
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
    </div>
  );
}

export default App;
