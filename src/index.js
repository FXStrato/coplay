import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import './common.css';
import './bulma.css';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';


<script src="https://www.gstatic.com/firebasejs/4.6.2/firebase.js"></script>

// Initialize Firebase
  var config = {
    apiKey: "AIzaSyAHnWjTONd9gXGE3NojGif5LfHM289dMv4",
    authDomain: "coplay-840e6.firebaseapp.com",
    databaseURL: "https://coplay-840e6.firebaseio.com",
    projectId: "coplay-840e6",
    storageBucket: "coplay-840e6.appspot.com",
    messagingSenderId: "602861674443"
  };
  firebase.initializeApp(config);

ReactDOM.render(<Router><App/></Router>, document.getElementById('root'));
registerServiceWorker();
