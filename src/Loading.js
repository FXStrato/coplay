import React, { Component } from 'react';
import { Spin, Row, Col } from 'antd';

class Loading extends Component {
  render() {
    return (
      <Row>
        <Col span={24} className="center" style={{paddingTop: 10}}>
          <Spin/>
        </Col>
      </Row>
    )
  }
}

export default Loading;
