import React, { Component } from 'react';
import { Row, Col, List, Icon, Button, Popconfirm, Pagination } from 'antd';
import ProgressiveImage from 'react-progressive-image-loading';
import Img from 'react-image';
import Lazy from 'react-lazy-load';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const db = firebase.firestore();

class Queue extends Component {

  state = {
    loading: false,
    data: null,
    page: 1,
    pageSize: 5,
    total: null,
    listType: 'horizontal'
  }

  componentWillMount = () => {
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({listType: 'vertical'});
    }
    this.getList();
  }

  //TODO: function needs to run whenever an update is discovered
  getList = () => {
    this.setState({loading: true});
    db.collection('rooms').doc('ABC').collection('queue').orderBy("timestamp", "desc").get().then(snap => {
      let temp = [];
      snap.forEach(doc => {
        let newDoc = doc.data();
        newDoc.fbid = doc.id;
        newDoc.isLoading = false;
        temp.push(newDoc);
      })
      this.setState({data: temp, loading: false});
    })
  }

  renderList = (data) => {
    return data.map((el, index) => {
      //max is the furthest index index of the selected page
      let max = this.state.pageSize * this.state.page;
      let min = max - this.state.pageSize;
      if(index >= min && index <= max - 1) {
        let diff = moment(el.timestamp).fromNow();
        let duration = this.formatDuration(el.duration);
        return <List.Item key={`listitem-${index}`}
           actions={[<Popconfirm title="Remove song?" onConfirm={(e) => this.handleDelete(el.fbid, index)}><Button loading={el.isLoading}>{!el.isLoading && <Icon type="delete"/>}</Button></Popconfirm>]}
           extra={this.state.listType === 'vertical' ? <Lazy offsetVertical={1000} className="queue-image" debounce={false} throttle={500}>
             <ProgressiveImage preview={el.song.thumbnails.medium.url} src={el.song.thumbnails.medium.url} render={(src, style) => <Img className="responsive-img" style={style} src={src} alt={`avatar`}/>}/></Lazy> : null}>
          <List.Item.Meta
            avatar={this.state.listType === 'horizontal' ? <Lazy offsetVertical={1000} className="queue-image" debounce={false} throttle={500}>
              <ProgressiveImage preview={el.song.thumbnails.medium.url} src={el.song.thumbnails.medium.url} render={(src, style) => <Img className="responsive-img" style={style} src={src} alt={`avatar`}/>}/></Lazy> : null}
            title={el.song.title}
            description={`${duration} | ${diff}`}
          />
          <p>Added by [insert name of adder here]</p>
        </List.Item>
      } else {
        return;
      }
    })
  }

  handleDelete = (id, index) => {
    let temp = this.state.data;
    temp[index].isLoading = true;
    this.setState({data: temp});
    db.collection('rooms').doc('ABC').collection('queue').doc(id).delete().then(() => {
      this.getList();
    }).catch(err => {
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
      onChange: ((page) => this.setState({page})),
    };
    let list;
    if(this.state.data && this.state.data.length > 0) list = this.renderList(this.state.data);
    return (
      <div>
        <Row style={{marginTop: 10, maxHeight: '65vh', overflow: 'auto', padding: 8}}>
          {list &&
          <Col span={24} className="right-align">
            <Pagination {...pagination}/>
          </Col>
          }
          {list &&
          <Col span={24}>
            <List itemLayout={this.state.listType}>
              {list}
            </List>
          </Col>
          }
          {!list && !this.state.loading ?
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
