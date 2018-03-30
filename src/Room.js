import React, { Component } from 'react';
import { Row, Col } from 'antd';

class Room extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col sm={24}>
            <h3>Room</h3>
            <p>
              Room should have this functionality:
            </p>
            <ul>
              <li>Room owner should have complete control of room while they are in it, play/pause, skip or remove song, add song, etc.</li>
              <li>Option to go public, or stay private</li>
              <li>A queue, and also a history of played songs</li>
              <li>Display of number of people in room</li>
              <li>Potentially a chat system</li>
              <li>Must have an account to create a room</li>
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Room;
