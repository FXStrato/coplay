import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import firebase from 'firebase';
import randomize from 'randomatic';

class Home extends Component {
  state = {
    uid: null,
    isAssociated: null,
  }

  componentWillMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        //console.log('Acquired ID of user on Home.js', user.uid);
        //Check to see if association of room exists
        firebase.database().ref('associations/' + user.uid).once('value').then((snapshot) => {
          if(!snapshot.val()) {
            //Means not associated
            this.setState({isAssociated: false});
          } else {
            this.setState({isAssociated: snapshot.val().room})
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

  createAssociation = () => {
    let roomName = randomize('Aa0', 16);
    if(!this.state.isAssociated) {
      firebase.database().ref('associations/' + this.state.uid).update({
        room: roomName
      }).then((response) => {
        this.props.history.push('room/' + roomName);
      });
    } else {
      this.props.history.push('room/' + this.state.isAssociated);
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
              {this.state.isAssociated !== null &&
              <a onClick={this.createAssociation} className="button is-dark">{this.state.isAssociated ? 'Go To Room' : 'Create Room'}</a>
              }
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Home;
