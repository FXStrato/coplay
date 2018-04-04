import React, { Component } from 'react';
import { Row, Col, List, Icon, Avatar, Card } from 'antd';


class Home extends Component {
  render() {
    const listData = [];
    for (let i = 0; i < 5; i++) {
      listData.push({
        href: 'http://ant.design',
        title: `Room #${i}`,
        avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
        description: 'Quick info about room',
        content: 'List of tags can go here',
      });
    }

    const pagination = {
      pageSize: 10,
      current: 1,
      total: listData.length,
      onChange: (() => {}),
    };

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 8 }} />
        {text}
      </span>
    );

    return (
      <div>
        <Row gutter={16}>
          <Col sm={24} md={24} lg={11}>
            <h2>Your Room</h2>
            <Card style={{width: "100%"}} title="Card title" extra={<a href="">More</a>}>
              <h2>Home</h2>
              <p>Home functionality</p>
              <ul>
                <li>Display of public rooms for people to join</li>
                <li>Quick link to personal room if it is up, otherwise display link to sign up and get ability to make room</li>
                <li>Notifications potentially in navbar?</li>
              </ul>
            </Card>
          </Col>
          <Col sm={24} md={24} lg={11}>
            <h2>Public Rooms</h2>
            <List
              bordered={true}
              pagination={pagination}
              dataSource={listData}
              renderItem={item => (
                <List.Item
                  key={item.title}
                  actions={[<IconText type="star-o" text="156" />, <IconText type="like-o" text="156" />, <IconText type="message" text="2" />]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={item.avatar} />}
                    title={<a href={item.href}>{item.title}</a>}
                    description={item.description}
                  />
                  {item.content}
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Home;
