import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import firebase from 'firebase';
import randomize from 'randomatic';

class Navigation extends Component {

  state = {
    ownRoom: null,
    uid: null
  }

  componentWillMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        firebase.database().ref('associations/' + user.uid).once('value').then((snapshot) => {
          if(snapshot.val()) {
            //Check if they have a room; if they don't, display create and create if they click; otherwise, link to their room
            this.setState({ownRoom: snapshot.val().ownRoom});
          } else {
            this.setState({ownRoom: false});
          }
          this.setState({uid: user.uid});
        });
        // ...
      } else {
        // User is signed out.
        // ...
      }
      // ...
    });
    document.addEventListener('DOMContentLoaded', function () {

      // Get all "navbar-burger" elements
      var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

      // Check if there are any navbar burgers
      if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(function ($el) {
          $el.addEventListener('click', function () {

            // Get the target from the "data-target" attribute
            var target = $el.dataset.target;
            var $target = document.getElementById(target);

            // Toggle the class on both the "navbar-burger" and the "navbar-menu"
            $el.classList.toggle('is-active');
            $target.classList.toggle('is-active');

          });
        });
      }
    });
  }

  componentDidMount = () => {
    this.assocRef = firebase.database().ref('associations/');
    this.assocRef.on('value', (snapshot) => {
      if(snapshot.val()) {
        if(snapshot.val()[this.state.uid] && snapshot.val()[this.state.uid].ownRoom) {
          //ownRoom found
          this.setState({ownRoom: snapshot.val()[this.state.uid].ownRoom});
        } else {
          this.setState({ownRoom: false});
        }
      } else {
        this.setState({ownRoom: false});
      }
    })
  }

  componentWillUnmount = () => {
    this.assocRef.off();
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
      <nav className="navbar is-dark is-fixed-top">
        <div className="navbar-brand">
          <div className="navbar-item is-size-5">CoPlay</div>
          <div className="navbar-burger burger" data-target="mobileMenu">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      <div id="mobileMenu" className="navbar-menu">
        <div className="navbar-start">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/about" className="navbar-item">About</Link>
          {this.state.ownRoom !== null ?
            this.state.ownRoom ?
            <Link to={'/room/' + this.state.ownRoom} className="navbar-item">My Room</Link>
            :
            <a className="navbar-item" onClick={this.createRoom}>Create Room</a>
            :
            null
          }
          <Link to="/list" className="navbar-item">Room List</Link>
        </div>
        <div className="navbar-end">
        </div>
      </div>
    </nav>
    );
  }
}

export default Navigation;
