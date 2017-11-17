import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Home extends Component {

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title">Home</h1>
              <Link to="room/temp" className="button is-dark">Test room</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default Home;
