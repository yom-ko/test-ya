import 'regenerator-runtime/runtime';
import React from 'react';
import { render } from 'react-dom';

// Import App component
import App from 'screens/App';

// Define App target node
const target = document.querySelector('#app');

// Render App
render(<App />, target);
