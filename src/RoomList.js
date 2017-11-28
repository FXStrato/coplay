import React, { Component } from 'react';
import firebase from 'firebase';

class RoomList extends Component {

  componentWillMount = () => {
    firebase.database().ref('/list').once('value').then(function(snapshot) {
      console.log(snapshot.val());
    });
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title">Room List</h1>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default RoomList;
