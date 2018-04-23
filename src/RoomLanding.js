import React, { Component } from 'react';
import { Row, Col, List, Icon, Avatar, Button, Popover } from 'antd';
import { Link } from 'react-router-dom';
import firebase from 'firebase';
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

class RoomLanding extends Component {

  state = {
    loading: false,
    roomlist: [],
    renderlist: null,
    page: 1,
    pageSize: 10,
    queuePopover: false,
    user: this.props.user
  }

  componentWillReceiveNewProps = (next, prev) => {
    if(next.user && !this.state.user) {
      this.setState({user: next.user});
      this.renderList();
    }
  }

  componentWillMount = () => {
    this.getList();
  }

  getList = () => {
    this.setState({ loading: true });
    db.collection('public').orderBy('timestamp').limit(100).get().then(snap => {
      let roomlist = [];
      snap.forEach(doc => {
        let item = doc.data();
        item.id = doc.id;
        roomlist.push(item);
      })
      if(!this.state.renderlist) {
        this.renderList(1, roomlist);
      }
      this.setState({ roomlist, loading: false });
    })
  }

  renderList = (page, data) => {
    let temp = [];
    let max = this.state.pageSize * page;
    let min = ((page - 1) * this.state.pageSize);
    for(let i = min; i < max; i++) {
      if(data[i]) temp.push(data[i]);
      else break;
    }
    this.setState({page, renderlist: temp});
  }

  render() {
    const pagination = {
      hideOnSinglePage: true,
      pageSize: this.state.pageSize,
      current: this.state.page,
      total: this.state.roomlist.length,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      onChange: page => this.renderList(page, this.state.roomlist),
    };

    const IconText = ({ type, text }) => (
      <span>
        <Icon type={type} style={{ marginRight: 5 }} />
        {text}
      </span>
    );

    return (
      <div>
        <Row justify="center" align="middle" type="flex">
          <Col sm={24} md={24} lg={24} xl={20}>
            {this.state.renderlist &&
              <div>
                {this.state.renderlist.length > 0 ?
                <List
                  loading={this.state.loading}
                  header={<div>Public Rooms <Button className="right" style={{marginTop: -5}} onClick={this.getList} disabled={this.state.loading}>{!this.state.loading ? <Icon type="sync"/>:<Icon type="loading"/>}</Button></div>}
                  bordered={true}
                  pagination={pagination}
                  dataSource={this.state.renderlist}
                  renderItem={item => (
                    <List.Item
                      key={item.id}
                      actions={item.isOpen
                        ?
                        [<IconText type="user" text={`${item.participantCount}/${item.capacity}`} />,
                        <Popover visible={this.state.queuePopover} onVisibleChange={v => this.setState({queuePopover: v})} content={<p>Anyone can queue up items to play</p>} title="Open Queue Enabled" trigger="click">
                        <Icon onClick={() => this.setState({queuePopover: true})} type="team"/>
                        </Popover>]
                        :
                        [<IconText type="user" text={`${item.participantCount}/${item.capacity}`} />]
                      }>
                      <List.Item.Meta
                        avatar={<Avatar icon={item.ownerPic ? null : 'user'} src={item.ownerPic} />}
                        title={<span>{item.name}'s Room {this.props.user.uid === item.owner ? <Icon type="star"/> : null}</span>}
                        description={<span className="truncate">{item.description}</span>}
                      />
                      <Link to={`room/${item.name}`}><Button type="primary">Join Room</Button></Link>
                    </List.Item>
                  )}
                />
                :
                <p className="center">No public rooms found :(</p>
                }
              </div>
            }
          </Col>
        </Row>
      </div>
    );
  }
}

export default RoomLanding;
