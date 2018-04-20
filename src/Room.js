import React, { Component } from 'react';
import { Row, Col, Card, Tabs, Badge, message, Modal, Spin } from 'antd';
import firebase from 'firebase';
import Loadable from 'react-loadable';
import Loading from './Loading';
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);
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
const Participants = Loadable({
  loader: () =>
    import('./Room/Participants'),
  loading: Loading
});
const RoomSettings = Loadable({
  loader: () =>
    import('./Room/RoomSettings'),
  loading: Loading
});
const NotFound = Loadable({
  loader: () =>
    import('./NotFound'),
  loading: Loading
});


class Room extends Component {

  state = {
    initialLoad: false,
    tab: "1",
    tabPosition: 'left',
    tabSize: 'large',
    queueSize: 0,
    participants: null,
    participantCount: null,
    user: null,
    roomID: this.props.match.params.roomID,
    fbid: null,
    room: null,
  }

  componentWillMount = () => {
    let roomID = this.props.match.params.roomID;
    //If room exists, continue with load
    db.collection('rooms').where('name', '==', roomID).get().then(snap => {
      if(snap.docs.length === 1) {
        let data = snap.docs[0].data();
        //Check Capacity
        if(data.participantCount >= data.capacity) {
          this.setState({initialLoad: true});
          Modal.info({
            title: 'Room at Full Capacity',
            content: <div><p>Unable to join room; room capacity limit has been reached</p></div>
          })
        } else {
          this.setState({fbid: snap.docs[0].id, room: snap.docs[0].data()})
          this.authRef = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
              this.setState({user});
              let temp = {
                name: user.displayName,
                photoURL: user.photoURL,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
              }
              db.collection("rooms").doc(snap.docs[0].id).collection("participants").doc(user.uid).set(temp).then(() => {
                this.setState({initialLoad: true});
              }).catch(err => {
                message.error('Error occured adding to party list');
                console.log(err);
                this.setState({initialLoad: true});
              });
            } else {
              this.setState({initialLoad: true});
            }
          });

          this.partyRef = db.collection("rooms").doc(snap.docs[0].id).collection("participants").onSnapshot(snup => {
            db.collection("rooms").doc(snap.docs[0].id).update({participantCount: snup.docs.length});
            if(data.isPublic) db.collection("public").doc(snap.docs[0].id).update({participantCount: snup.docs.length});
            this.setState({participants: snup, participantCount: snup.docs.length});
          })

          this.queueRef = db.collection("rooms").doc(snap.docs[0].id).collection("queue").onSnapshot(snap => {
            this.setState({queueSize: snap.size});
          });
        }
      } else {
        this.setState({initialLoad: true});
        //Modal.info({title: 'Room Not Found', content: (<p>The requested room does not exist or has been deleted</p>)})
      }
    })

    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({tabPosition: 'top', tabSize: 'small'});
    }
  }

  componentWillUnmount = () => {
    if(this.state.user) {
      db.collection("rooms").doc(this.state.fbid).collection("participants").doc(this.state.user.uid).delete();
      db.collection("rooms").doc(this.state.fbid).update({participantCount: (this.state.participantCount - 1)});
      if(this.state.room.isPublic) db.collection("public").doc(this.state.fbid).update({participantCount: (this.state.participantCount - 1)});
    }
    if(this.queueRef) this.queueRef();
    if(this.partyRef) this.partyRef();
    if(this.authRef) this.authRef();
  }

  onTabChange = (key) => {
    this.setState({ tab: key });
 }

  render() {
    return (
      <Spin spinning={!this.state.initialLoad} style={{width: '100%'}} className="center">
        {this.state.initialLoad &&
          <div>
            {this.state.fbid ?
            <Row gutter={16} style={{marginTop: -20}}>
              <Col xs={24} style={{marginBottom: 10}}>
                <h2 className="center">{this.state.roomID}'s Room</h2>
              </Col>
              <Col sm={24} md={24} lg={24} xl={18}>
                <Card style={{width: '100%'}}>
                  <Tabs defaultActiveKey="1" onChange={this.onTabChange} tabPosition={this.state.tabPosition} size={this.state.tabSize}>
                    <TabPane tab={<span>Now Playing</span>} key="1"><Current fbid={this.state.fbid}/></TabPane>
                    <TabPane tab={<span>Search</span>} key="2"><Search fbid={this.state.fbid}/></TabPane>
                    <TabPane tab={<span>Queue {this.state.queueSize > 0 && <Badge count={this.state.queueSize} style={{ backgroundColor: '#fff', color: '#999', boxShadow: '0 0 0 1px #d9d9d9 inset' }}/>}</span>} key="3"><Queue fbid={this.state.fbid}/></TabPane>
                    <TabPane tab={<span>History</span>} key="4"><History fbid={this.state.fbid}/></TabPane>
                    <TabPane tab={<span>Participants</span>} key="5"><Participants owner={this.state.room.owner} list={this.state.participants}/></TabPane>
                    <TabPane tab={<span>Settings</span>} key="6">{this.state.tab === "6" ? <RoomSettings user={this.state.user} roomID={this.state.roomID}/>: null}</TabPane>
                  </Tabs>
                </Card>
              </Col>
              {/* <Col md={24} lg={24} xl={6} className="hide-on-large-and-down">
                <h2>Chat window</h2>
              </Col> */}
            </Row>
            :
            <NotFound/>
            }
          </div>
        }
      </Spin>
    );
  }
}

export default Room;
