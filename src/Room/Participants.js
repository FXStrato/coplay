import React, { Component } from 'react';
import { Row, Col, Table, Avatar } from 'antd';
import moment from 'moment';

class Participants extends Component {

  renderTable = (data) => {
    //Data comes back as a firebase object, iterate to get each one
    let result = [];
    data.forEach((doc) => {
      let temp = {
        key: doc.id,
        name: doc.data().name,
        rank: "",
        joined: moment(doc.data().timestamp).fromNow(),
        photoURL: doc.data().photoURL
      };
      result.push(temp);
    })
    return result;
  }

  render() {
    let data;
    if(this.props.list) data = this.renderTable(this.props.list);
    else data = [];
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => <span><Avatar src={record.photoURL} style={{marginRight: 5}}/>{text}</span>
    }, {
      title: 'Rank',
      dataIndex: 'rank',
    }]
    return (
      <div>
        <Row>
          <Col span={24}>
            <h3>Participants</h3>
            <Table columns={columns} dataSource={data}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Participants;
