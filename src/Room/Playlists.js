import React, { Component } from 'react';
import { Row, Col } from 'antd';


class Playlists extends Component {
  render() {
    return (
      <div>
        <Row>
          <Col span={24}>
            <h3>Playlists</h3>
            <p>Feature allowing you to save playlists from either queue, history, or just generating one</p>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Playlists;
