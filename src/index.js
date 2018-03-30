import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import firebase from 'firebase';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
require('firebase/firestore');

// Initialize Firebase
let config = {
  apiKey: process.env.REACT_APP_FIREBASEAPIKEY2,
  authDomain: "coplay-2.firebaseapp.com",
  databaseURL: "https://coplay-2.firebaseio.com",
  projectId: "coplay-2",
  storageBucket: "",
  messagingSenderId: "1094451613126"
};
firebase.initializeApp(config);


ReactDOM.render(<Router><App/></Router>, document.getElementById('root'));
registerServiceWorker();
