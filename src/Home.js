import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import firebase from 'firebase';
import randomize from 'randomatic';

class Home extends Component {
  state = {
    uid: null,
    ownRoom: null,
    rooms: {}
  }

  componentWillMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        //console.log('Acquired ID of user on Home.js', user.uid);
        //Check to see if association of room exists
        firebase.database().ref('associations/' + user.uid).once('value').then((snapshot) => {
          console.log(snapshot.val());
          if(!snapshot.val() || !snapshot.val().ownRoom) {
            //Means not associated
            this.setState({ownRoom: false});
          } else if(snapshot.val().ownRoom) {
            this.setState({ownRoom: snapshot.val().ownRoom});
          } else {
            console.log(snapshot.val());
          }
        });
        this.setState({uid: user.uid});
        // ...
      } else {
        // User is signed out.
        // ...
      }
      // ...
    });
  }

  createRoom = () => {
    let roomName = randomize('Aa0', 16);
    if(!this.state.ownRoom) {
      firebase.database().ref('associations/' + this.state.uid).set({
        ownRoom: roomName
      }).then((response) => {
        this.props.history.push('room/' + roomName);
      });
    } else {
      this.props.history.push('room/' + this.state.ownRoom);
    }
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title">Home</h1>
            </div>
          </div>
          <div className="columns">
            <div className="column">
              {this.state.ownRoom !== null &&
              <a onClick={this.createRoom} className="button is-dark">{this.state.ownRoom ? 'Go To Room' : 'Create Room'}</a>
              }
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Home;
