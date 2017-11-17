import React, { Component } from 'react';
import Navigation from './Navigation';
import About from './About';
import Home from './Home';
import RoomList from './RoomList';
import Room from './Room';
import firebase from 'firebase';
import { Route, Switch, withRouter } from 'react-router-dom';

class App extends Component {

  componentWillMount = () => {
    firebase.auth().signInAnonymously().catch((error) => {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      console.log(errorCode + " | " + errorMessage);
      // ...
    });
  }

  render() {
    return (
      <div>
        <header><Navigation/></header>
        <main>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route path="/about" component={About}/>
            <Route path="/list" component={RoomList}/>
            <Route path="/room/:roomID" component={Room}/>
          </Switch>
        </main>
        <footer>
        </footer>
      </div>
    );
  }
}

export default withRouter(App);
