import React, { Component } from 'react';
import { Row, Col } from 'antd';
import firebase from 'firebase';


class Profile extends Component {

  state = {
    initialLoad: false,
    loading: false,
    user: null,
  }

  componentWillMount = () => {
    this.setState({loading: true});
    this.authRef = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({user});
        console.log('logged user', user);
      } else {
        // User is signed out.
      }
      this.setState({loading: false, initialLoad: true});
    });
  }

  componentWillUnmount = () => {
    this.authRef();
  }

  render() {
    return (
      <div>
        {this.state.initialLoad &&
        <Row>
          {!this.state.loading && !this.state.user ?
          <Col span={24}>
            <h3>Login to view profile</h3>
          </Col>
          :
          <Col span={24}>
            <h3>Profile</h3>
          </Col>
          }
        </Row>
        }
      </div>
    );
  }
}

export default Profile;
