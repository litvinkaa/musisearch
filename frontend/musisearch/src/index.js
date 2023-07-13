import React, { createContext } from 'react';
import App from './App.js';
import UserStore from './store/UserStore';
import { createRoot } from 'react-dom/client';

const container = document.getElementById('root');
const root = createRoot(container); 

export const Context = createContext(null)

root.render(
  <Context.Provider value={{
    user: new UserStore()}
  }>
        <React.StrictMode>
    <App />
    </React.StrictMode>
  </Context.Provider>);


