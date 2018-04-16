import React, { Component } from 'react';
import { Row, Col, List, Icon, Avatar } from 'antd';


class RoomLanding extends Component {
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
        <Row justify="center" align="middle" type="flex">
          <Col sm={24} md={24} lg={24} xl={20}>
            <List
              header="Public Rooms"
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

export default RoomLanding;
