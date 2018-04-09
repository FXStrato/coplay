import React, { Component } from 'react';
import { Row, Col, Card, Tabs, Badge } from 'antd';
import firebase from 'firebase';
import Loadable from 'react-loadable';
import Loading from './Loading';
const db = firebase.firestore();
const TabPane = Tabs.TabPane;
const Current = Loadable({
  loader: () =>
    import('./Room/Current'),
  loading: Loading
});
const Search = Loadable({
  loader: () =>
    import('./Room/Search'),
  loading: Loading
});
const History = Loadable({
  loader: () =>
    import('./Room/History'),
  loading: Loading
});
const Queue = Loadable({
  loader: () =>
    import('./Room/Queue'),
  loading: Loading
});
const Playlists = Loadable({
  loader: () =>
    import('./Room/Playlists'),
  loading: Loading
});

class Room extends Component {

  state = {
    tab: 'current',
    tabPosition: 'left',
    tabSize: 'large',
    queueSize: 0,
  }

  componentWillMount = () => {
    this.queueRef = db.collection("rooms").doc("ABC").collection("queue").onSnapshot(snap => {
      this.setState({queueSize: snap.size});
    })
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({tabPosition: 'top', tabSize: 'small'});
    }
  }

  componentWillUnmount = () => {
    this.queueRef();
  }

  onTabChange = (key) => {
   this.setState({ tab: key });
 }

  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col sm={24} md={24} lg={24} xl={18}>
            <Card style={{width: '100%'}}>
              <Tabs defaultActiveKey="1" tabPosition={this.state.tabPosition} size={this.state.tabSize}>
                <TabPane tab={<span>Now Playing</span>} key="1"><Current/></TabPane>
                <TabPane tab={<span>Search</span>} key="2"><Search/></TabPane>
                <TabPane tab={<span>Queue {this.state.queueSize > 0 && <Badge count={this.state.queueSize} style={{ backgroundColor: '#03a09e' }}/>}</span>} key="3"><Queue/></TabPane>
                <TabPane tab={<span>History</span>} key="4"><History/></TabPane>
                <TabPane tab={<span>Playlists</span>} key="5"><Playlists/></TabPane>
              </Tabs>
            </Card>
          </Col>
          {/* <Col md={24} lg={24} xl={6} className="hide-on-large-and-down">
            <h2>Chat window</h2>
          </Col> */}
        </Row>
      </div>
    );
  }
}

export default Room;
