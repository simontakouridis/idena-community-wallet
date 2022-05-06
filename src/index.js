import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import generalReducer from './core/reducers';
import createSagaMiddleware from 'redux-saga';
import appRootSaga from './core/sagas';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';

const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer: {
    general: generalReducer
  },
  middleware: getDefaultMiddleware => [...getDefaultMiddleware(), sagaMiddleware]
});
sagaMiddleware.run(appRootSaga);

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
