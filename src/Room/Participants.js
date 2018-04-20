import React, { Component } from 'react';
import { Row, Col, Table, Avatar, Icon } from 'antd';
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
        joined: moment(doc.data().timestamp.toDate()).fromNow(),
        photoURL: doc.data().photoURL
      };
      result.push(temp);
    })
    return result;
  }

  render() {
    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      render: (text, record) => <span><Avatar icon={record.photoURL ? null : 'user'} src={record.photoURL} style={{marginRight: 5}}/>{text} {this.props.owner === record.key ? <Icon style={{marginLeft: 2}} type="star"/>: null}</span>
    }]
    const pagination = {
      hideOnSinglePage: true,
      total: this.props.list ? this.props.list.length : 0,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
    };
    let data;
    if(this.props.list) data = this.renderTable(this.props.list);
    else data = [];
    return (
      <div>
        <Row>
          <Col span={24}>
            <h3>Participants</h3>
            <Table showHeader={false} columns={columns} dataSource={data} pagination={pagination}/>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Participants;
