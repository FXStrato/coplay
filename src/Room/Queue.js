import React, { Component } from 'react';
import { Row, Col, List, Icon, Button, Popconfirm, Pagination } from 'antd';
import Img from 'react-image';
import LazyLoad from 'react-lazyload';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const db = firebase.firestore();

class Queue extends Component {

  state = {
    data: null,
    loading: false,
    listLoading: false,
    page: 1,
    pageSize: 5,
    total: null,
    listType: 'horizontal'
  }

  componentDidUpdate = () => {
    if(this.queue) this.queue.focus();
  }

  componentWillMount = () => {
    this.setState({loading: true});
    this.queueRef = db.collection("rooms").doc("ABC").collection("queue").orderBy("timestamp", "asc").onSnapshot(snap => {
      let temp = [];
      snap.forEach(doc => {
        let newDoc = doc.data();
        newDoc.fbid = doc.id;
        newDoc.isLoading = false;
        temp.push(newDoc);
      })
      this.setState({data: temp, loading: false});
    })
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({listType: 'vertical'});
    }
    //this.getList();
  }

  componentWillUnmount = () => {
    this.queueRef();
  }

  renderList = (data) => {
    return data.map((el, index) => {
      //max is the furthest index index of the selected page
      let max = this.state.pageSize * this.state.page;
      let min = max - this.state.pageSize;
      if(index >= min && index <= max - 1) {
        let diff = moment(el.timestamp).fromNow();
        let duration = this.formatDuration(el.duration);
        return <List.Item key={`listitem-${el.fbid}`}
           actions={[<Popconfirm title="Remove from queue?" onConfirm={(e) => this.handleDelete(el.fbid, index)}><Button loading={el.isLoading}>{!el.isLoading && <Icon type="delete"/>}</Button></Popconfirm>]}
           extra={this.state.listType === 'vertical' ? <LazyLoad height={'100%'} overflow={true}><Img className="queue-image" src={el.thumbnails.medium.url} alt={`${el.videoId}-thumbnail`}/></LazyLoad> : null}>
          <List.Item.Meta
            avatar={this.state.listType === 'horizontal' ? <LazyLoad height={'100%'} overflow={true}><Img className="queue-image shadow" src={el.thumbnails.medium.url} alt={`${el.videoId}-thumbnail`}/></LazyLoad> : null}
            title={<span className="truncate">{el.title}</span>}
            description={`${duration} | ${diff}`}
          />
          <p>Added by {el.adder}</p>
        </List.Item>
      } else {
        return null;
      }
    })
  }

  handleDelete = (id, index) => {
    let temp = this.state.data;
    temp[index].isLoading = true;
    this.setState({data: temp});
    db.collection('rooms').doc('ABC').collection('queue').doc(id).delete().then(() => {
      //this.getList();
    }).catch(err => {
      console.log(err);
    })
  }

  handleMassDelete = () => {
    this.setState({listLoading: true});
    db.collection('rooms').doc('ABC').collection('queue').get().then(snap => {
      snap.forEach(doc => {
        db.collection('rooms').doc('ABC').collection('queue').doc(doc.id).delete();
      })
      this.setState({listLoading: false});
    }).catch(err => {
      this.setState({listLoading: false});
      console.log(err);
    })
  }

  formatDuration = (d) => {
    if (d === "PT0S") return "LIVE";
    return moment.duration(d).format('H:mm:ss');
  }

  render() {
    const pagination = {
      pageSize: this.state.pageSize,
      current: this.state.page,
      size: 'small',
      hideOnSinglePage: true,
      total: this.state.data ? this.state.data.length : 0,
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
      onChange: (page) => this.setState({page}),
    };
    let list;
    if(this.state.data && this.state.data.length > 0) list = this.renderList(this.state.data);
    return (
      <div>
        {list &&
        <Row>
          <Col xs={24} sm={24} md={12} lg={12}><Pagination {...pagination}/></Col>
          <Col xs={24} sm={24} md={12} lg={12} align="right">
            <Popconfirm title="Delete all items in queue?" onConfirm={this.handleMassDelete}><Button>Delete All</Button></Popconfirm>
          </Col>
        </Row>
        }
        <Row style={{marginTop: 10, maxHeight: '65vh', overflow: 'auto', padding: 8}}>
          <span ref={q => {this.queue = q}}></span>
          {list &&
          <Col span={24}>
            <List loading={this.state.listLoading} itemLayout={this.state.listType}>
              {list}
            </List>
          </Col>
          }
          {!list && !this.state.loading && !this.state.listLoading ?
          <Col span={24} className="center">
            <p>To add to the queue, search up songs from the Search tab</p>
          </Col>
          : null}
        </Row>
      </div>
    );
  }
}

export default Queue;
