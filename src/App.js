import React, { Component } from 'react';
import { Route, Switch, withRouter, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import Img from 'react-image';
import firebase from 'firebase';
import Loading from './Loading';
import Logo from './img/logo.png';
import { Row, Col, Menu, Layout, Dropdown, Button, Modal, Avatar } from 'antd';
const { Header, Content, Footer } = Layout;
const Home = Loadable({
  loader: () =>
    import('./Home'),
  loading: Loading
})
const Room = Loadable({
  loader: () =>
    import('./Room'),
  loading: Loading
})
const About = Loadable({
  loader: () =>
    import('./About'),
  loading: Loading
})
const Login = Loadable({
  loader: () =>
    import('./Login'),
  loading: Loading
})
const Signup = Loadable({
  loader: () =>
    import('./Signup'),
  loading: Login
})
const Profile = Loadable({
  loader: () =>
    import('./Profile'),
  loading: Loading
})
const RoomLanding = Loadable({
  loader: () =>
    import('./RoomLanding'),
  loading: Loading
})
const NotFound = Loadable({
  loader: () =>
    import('./NotFound'),
  loading: Loading
})

class App extends Component {

  state = {
    initialLoad: false,
    visible: false,
    type: null,
    user: null,
    personal: null,
  }

  //TODO: Upon disconnecting, also remove from any room if in one
  componentWillMount = () => {
    this.authRef = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({user, visible: false});
        this.userRef = firebase.firestore().collection('users').doc(user.uid).onSnapshot(doc => {
          this.setState({personal: doc.data()});
        });
        firebase.database().ref('.info/connected').on('value', snap => {
          if(!snap.val()) {
            //firebase.firestore().doc('/status/' + user.uid).set({state: 'offline', last_seen: firebase.firestore.FieldValue.serverTimestamp()});
            firebase.firestore().collection('rooms').doc('ABC').collection('party').doc(user.uid).delete();
            return;
          }
          //TODO: if disconnecting in a room, remove self from room party list
          firebase.database().ref('/status/' + user.uid).onDisconnect().set({state: 'offline', last_seen: firebase.database.ServerValue.TIMESTAMP}).then(() => {
            //firebase.firestore().doc('/status/' + user.uid).set({state: 'online', last_seen: firebase.firestore.FieldValue.serverTimestamp()});
            firebase.database().ref('/status/' + user.uid).set({state: 'online', last_seen: firebase.database.ServerValue.TIMESTAMP})
          })
        })
        console.log('user is logged in');
      } else {
        // User is signed out.
      }
      this.setState({initialLoad: true});
    });
  }

  componentWillUnmount = () => {
    this.authRef();
    if(this.userRef) this.userRef();
  }

  openModal = (type) => {
    this.setState({visible: true, type});
  }

  profileCallback = (res) => {
    if(res) {
      this.setState({user: firebase.auth().currentUser});
    }
  }

  signUpCallback = (res) => {
    this.setState({visible: true, type: 'Signup'});
  }

  handleLogMenu = (item) => {
    if(item.key === "3") {
      this.handleSignout();
    }
  }

  handleSignout = () => {
    if(this.state.user) {
      firebase.auth().signOut().then(() => {
        window.location.reload();
        // Sign-out successful.
      }).catch((error) => {
        // An error happened.
        console.log(error);
      });
    }
    window.location.reload();
  }

  highlightMenu = () => {
    let temp = this.props.location.pathname;
    if (temp === '/') return ['1'];
    else if (temp === '/rooms') return ['2'];
    else if (temp === '/about') return ['3'];
    else return [];
  }

  render() {
    let defaultMenuKey = this.highlightMenu();
    let roomMade;
    if(this.state.personal && this.state.personal.roomMade) roomMade = "/room/" + this.state.user.displayName;
    else roomMade = "/";
    const logMenu = (
      <Menu onClick={this.handleLogMenu}>
        <Menu.Item key="0">
          <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to={roomMade}>My Room</Link>
        </Menu.Item>
        <Menu.Item key="1">
          <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to="/profile">Profile</Link>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item key="3">
          <a style={{marginTop: 5, marginBottom: 5, width: 150}}>Sign Out</a>
        </Menu.Item>
      </Menu>
    )
    const dropdownMenu = (<Menu selectedKeys={defaultMenuKey}>
      <Menu.Item key="1">
        <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link style={{marginTop: 5, marginBottom: 5}} to="/rooms">Rooms</Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to="/about">About</Link>
      </Menu.Item>
      <Menu.Divider/>
      <Menu.Item style={{background: 'white'}}>
        <Button style={{width: '100%'}} onClick={() => this.openModal("Login")}>Login</Button>
      </Menu.Item>
      <Menu.Item style={{background: 'white'}}>
        <Button style={{width: '100%'}} type="primary" onClick={() => this.openModal("Signup")}>Sign up</Button>
      </Menu.Item>
    </Menu>);
    return (
      <div>
      <Layout style={{height: "100vh"}}>
      <Header className="animated fadeIn">
        <Row>
          <Col sm={12} md={24}>
            <div style={{
                float: 'left',
                color: 'black',
                marginRight: 20,
                marginLeft: -10
              }}>
              <Link to="/"><Img className="responsive-img animated fadeIn" src={Logo} alt="CoPlay Logo" loader={<span style={{width: 94, color: 'white'}}>CoPlay</span>}/></Link>
            </div>
            <div className="right hide-on-med-and-down">
              {this.state.initialLoad &&
              <div className="right hide-on-med-and-down">
                {this.state.user ?
                <Dropdown overlay={logMenu} trigger={['click']}>
                  <a className="ant-dropdown-link">
                    <Avatar size="large" shape="square" src={this.state.user.photoURL} icon={this.state.user.photoURL ? null : 'user'} style={{marginTop: -10}}/>
                  </a>
                </Dropdown>
                :
                <span>
                  <Button type="secondary" style={{marginRight: 10}} onClick={() => this.openModal('Login')}>Log In</Button>
                  <Button type="primary" onClick={() => this.openModal('Signup')}>Sign Up</Button>
                </span>
                }
              </div>
              }
            </div>
            <Menu mode="horizontal" className="hide-on-med-and-down" selectedKeys={defaultMenuKey} style={{
                lineHeight: '62px',
                borderBottom: 'none',
              }}>
              <Menu.Item key="2">
                <Link to="/rooms">Rooms</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/about">About</Link>
              </Menu.Item>
            </Menu>
          </Col>
          <Col sm={4} md={4} className="right-align hide-on-med-and-up show-on-med right">
            <Dropdown overlay={dropdownMenu} trigger={['click']} placement="bottomRight">
              <a className="ant-dropdown-link" style={{
                  textDecoration: 'none',
                  color: '#000',
                  marginRight: -10,
                }} href="">
                <i className="material-icons" style={{paddingTop: 20}}>menu</i>
              </a>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Content style={{margin: '24px 16px 0'}}>
        <div style={{
            padding: 24,
            minHeight: 360
          }}>
          <Switch>
            <Route exact={true} path="/" render={props => <Home {...props} callback={this.signUpCallback}/>}/>
            <Route exact={true} path="/rooms" component={RoomLanding}/>
            <Route exact={true} path="/room/:roomID" component={Room}/>
            <Route exact={true} path="/profile" render={props => <Profile {...props} callback={this.profileCallback}/>}/>
            <Route exact={true} path="/about" component={About}/>
            <Route component={NotFound}/>
          </Switch>
        </div>
      </Content>
      <Footer style={{textAlign: 'center'}}>
        CoPlay v.2.0 ©2018
      </Footer>
    </Layout>
    <Modal
      title={this.state.type}
      wrapClassName="vertical-center-modal"
      visible={this.state.visible}
      footer={null}
      onOk={() => this.setState({visible: false})}
      onCancel={() => this.setState({visible: false})}
    >
      {this.state.type === "Login" ?
      <Login/>
      :
      <Signup/>
      }
    </Modal>
  </div>
    );
  }
}

export default withRouter(App);
