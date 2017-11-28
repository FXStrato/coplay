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
          if(!snapshot.val() || !snapshot.val().ownRoom) {
            //Means not associated
            this.setState({ownRoom: false});
          } else if(snapshot.val().ownRoom) {
            this.setState({ownRoom: snapshot.val().ownRoom});
          } else {
            //console.log(snapshot.val());
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
    //Created rooms are initially private
    let roomName = randomize('Aa0', 16);
    if(!this.state.ownRoom) {
      firebase.database().ref('associations/' + this.state.uid).set({
        ownRoom: roomName
      }).then((response) => {
        firebase.database().ref('room/' + roomName).set({
          isPublic: false
        });
        this.props.history.push('room/' + roomName);
      });
    } else {
      this.props.history.push('room/' + this.state.ownRoom);
    }
  }

  render() {
    return (
      <div>
        <section className="hero is-dark is-bold">
          <div className="hero-body">
            <div className="container">
              <h1 className="title">
                Welcome to CoPlay
              </h1>
              <h2 className="subtitle">
                Share, join and collaborate your music
              </h2>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="columns">
              <div className="column has-text-centered">
                <div className="title">Start A Playlist</div>
                <p>Create a room and start queueing music from Youtube</p>
                {this.state.ownRoom !== null &&
                <div style={{marginTop: 10}}>
                  <a onClick={this.createRoom} className="button is-dark">{this.state.ownRoom ? 'Go To Room' : 'Create Room'}</a>
                </div>
                }
              </div>
              <div className="column has-text-centered">
                <div className="title">Join an Existing Room</div>
                <p>Pick a public room to join and check out what people are listening to</p>
                <div style={{marginTop: 10}}>
                  <Link to="/list" className="button is-info">View Rooms</Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Home;
