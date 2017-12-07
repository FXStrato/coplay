import React, { Component } from 'react';

class About extends Component {
  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title">About This Project</h1>
              <p>This project is a simple React application that allows people to enter a single room and share music and/or videos by queueing up Youtube videos. Data is stored in Firebase to keep track of queue, history, and currently playing songs. Technologies used are listed below:</p>
              <div>
                <ul>
                  <li>Framework: React</li>
                  <li>CSS: Bulma</li>
                  <li>Backend: Firebase</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default About;
