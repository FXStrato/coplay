import React, { Component } from 'react';
import { Row, Col, Card, Tabs, Badge, message } from 'antd';
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
const Participants = Loadable({
  loader: () =>
    import('./Room/Participants'),
  loading: Loading
});

/*
TODO: Need to run a check to see if this is the user's room, assign them admin privileges

 */


class Room extends Component {

  state = {
    initialLoad: false,
    tab: 'current',
    tabPosition: 'left',
    tabSize: 'large',
    queueSize: 0,
    participants: null,
    user: null,
  }

  componentWillMount = () => {
    this.authRef = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({user});
        let temp = {
          name: user.displayName,
          photoURL: user.photoURL,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }
        db.collection("rooms").doc("ABC").collection("participants").doc(user.uid).set(temp).then(() => {
          this.setState({initialLoad: true});
        }).catch(err => {
          message.error('Error occured adding to party list');
          console.log(err);
          this.setState({initialLoad: true});
        });
      } else {
        this.setState({initialLoad: true});
      }

      this.partyRef = db.collection("rooms").doc("ABC").collection("participants").onSnapshot(snap => {
        this.setState({participants: snap});
      })

      this.queueRef = db.collection("rooms").doc("ABC").collection("queue").onSnapshot(snap => {
        this.setState({queueSize: snap.size});
      });
    });

    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({tabPosition: 'top', tabSize: 'small'});
    }
  }

  componentWillUnmount = () => {
    if(this.state.user) db.collection("rooms").doc("ABC").collection("participants").doc(this.state.user.uid).delete();
    this.queueRef();
    this.partyRef();
  }

  onTabChange = (key) => {
   this.setState({ tab: key });
 }

  render() {
    return (
      <div>
        {this.state.initialLoad &&
        <Row gutter={16}>
          <Col sm={24} md={24} lg={24} xl={18}>
            <Card style={{width: '100%'}}>
              <Tabs defaultActiveKey="1" tabPosition={this.state.tabPosition} size={this.state.tabSize}>
                <TabPane tab={<span>Now Playing</span>} key="1"><Current/></TabPane>
                <TabPane tab={<span>Search</span>} key="2"><Search/></TabPane>
                <TabPane tab={<span>Queue {this.state.queueSize > 0 && <Badge count={this.state.queueSize} style={{ backgroundColor: '#03a09e' }}/>}</span>} key="3"><Queue/></TabPane>
                <TabPane tab={<span>History</span>} key="4"><History/></TabPane>
                <TabPane tab={<span>Playlists</span>} key="5"><Playlists/></TabPane>
                <TabPane tab={<span>Participants</span>} key="6"><Participants list={this.state.participants} user={this.state.user}/></TabPane>
              </Tabs>
            </Card>
          </Col>
          {/* <Col md={24} lg={24} xl={6} className="hide-on-large-and-down">
            <h2>Chat window</h2>
          </Col> */}
        </Row>
        }
      </div>
    );
  }
}

export default Room;
