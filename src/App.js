import React, { Component } from 'react';
import { Route, Switch, withRouter, Link } from 'react-router-dom';
import Loadable from 'react-loadable';
import Img from 'react-image';
import Loading from './Loading';
import Logo from './img/logo.png';
import { Row, Col, Menu, Layout, Dropdown, Button, Modal } from 'antd';
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
const NotFound = Loadable({
  loader: () =>
    import('./NotFound'),
  loading: Loading
})

class App extends Component {

  state = {
    visible: false,
    type: null,
  }

  openModal = (type) => {
    this.setState({visible: true, type});
  }

  highlightMenu = () => {
    switch (this.props.location.pathname) {
    case '/':
      return ['1'];
    case '/room':
      return ['2'];
    case '/about':
      return ['3'];
    default:
      return [];
    }
  }

  render() {
    let cPath = this.props.location.pathname;
    let defaultMenuKey = this.highlightMenu();
    const dropdownMenu = (<Menu selectedKeys={defaultMenuKey}>
      <Menu.Item key="1">
        <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to="/" replace={"/" === cPath}>Home</Link>
      </Menu.Item>
      <Menu.Item key="2">
        <Link style={{marginTop: 5, marginBottom: 5}} to="/room" replace={"/room" === cPath}>Room</Link>
      </Menu.Item>
      <Menu.Item key="3">
        <Link style={{marginTop: 5, marginBottom: 5, width: 150}} to="/about" replace={"/" === cPath}>About</Link>
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
              <Link to="/" replace={"/" === cPath}><Img className="responsive-img" src={Logo} alt="CoPlay Logo" unloader={<span>CoPlay</span>}/></Link>
            </div>
            <div className="right hide-on-med-and-down">
              <Button type="secondary" style={{marginRight: 10}} onClick={() => this.openModal('Login')}>Log In</Button>
              <Button type="primary" onClick={() => this.openModal('Signup')}>Sign Up</Button>
              {/* <Avatar size="large" shape="square" src="" style={{marginTop: -10}}/> */}
            </div>
            <Menu mode="horizontal" className="hide-on-med-and-down" selectedKeys={defaultMenuKey} style={{
                lineHeight: '62px',
                borderBottom: 'none',
              }}>
              <Menu.Item key="2">
                <Link to="/room" replace={"/room" === cPath}>Room</Link>
              </Menu.Item>
              <Menu.Item key="3">
                <Link to="/about" replace={"/" === cPath}>About</Link>
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
            <Route exact={true} path="/" component={Home}/>
            <Route exact={true} path="/room" component={Room}/>
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
