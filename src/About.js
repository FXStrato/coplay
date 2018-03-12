import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import reactBanner from './img/react-banner.png';
import firebaseBanner from './img/firebase-banner.png';
import bulmaBanner from './img/bulma-banner.png';

class About extends Component {
  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title">About This Project</h1>
              <p>This project is a simple React application that allows people to enter a single room and share music and/or videos by queueing up Youtube videos. Data is stored in Firebase to keep track of queue, history, and currently playing songs, while Bulma is used to style the site.</p>
            </div>
          </div>
          <div className="columns">
            <div className="column"><a href="https://reactjs.org/" target="_blank"><img style={{marginTop: 50}} src={reactBanner} alt="React Banner"/></a></div>
            <div className="column"><a href="https://firebase.google.com/" target="_blank"><img src={firebaseBanner} alt="Firebase Banner"/></a></div>
            <div className="column"><a href="https://bulma.io/" target="_blank"><img src={bulmaBanner} alt="Bulma Banner"/></a></div>
          </div>
        </div>
      </section>
    );
  }
}

export default About;
