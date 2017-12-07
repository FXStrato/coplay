import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import firebase from 'firebase';
import _ from 'lodash';

class RoomList extends Component {
  state = {
    rooms: [],
    formatRoomList: null,
    showNoPublic: false,
  }

  componentWillMount = () => {
    this.listRef = firebase.database().ref('list/');
    firebase.database().ref('/list').once('value').then((snapshot) => {
      if(snapshot.val()) {
        this.renderList(snapshot.val());
      }
    });

    //Listener for roomlist changes
    this.listRef.on('value', (snapshot) => {
      if(snapshot.val()) {
        this.renderList(snapshot.val());
      } else {
        this.setState({formatRoomList: null, showNoPublic: true})
      }
      console.log(snapshot.val());
    })
  }

  componentWillUnmount = () => {
    this.listRef.off();
  }

  renderList = (data) => {
    let result = _.map(data, (el, index) => {
      return (
        <tr key={'room-' + index}>
          <td>
            <Link to={"/room/" + index}>{el.roomName}</Link>
          </td>
        </tr>
      )
    })
    this.setState({formatRoomList: result, showNoPublic: false});
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <h1 className="title has-text-centered">Public Room List</h1>
            </div>
          </div>
          <div className="columns">
            <div className="column">
              <table className="table is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>Room Name</th>
                  </tr>
                </thead>
                <tbody>
                  {this.state.formatRoomList}
                </tbody>
              </table>
            </div>
          </div>
          {this.state.showNoPublic &&
          <div className="columns">
            <div className="column">
              <div className="has-text-centered">No Public Rooms Found</div>
            </div>
          </div>
          }
        </div>
      </section>
    );
  }
}

export default RoomList;
