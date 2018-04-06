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
    data: this.props.queue,
    loading: false,
    page: 1,
    pageSize: 5,
    total: null,
    listType: 'horizontal'
  }

  componentDidUpdate = () => {
    if(this.queue) this.queue.focus();
  }

  componentWillReceiveProps = (next, prev) => {
    if(next.queue !== this.state.data) {
      this.setState({data: next.queue});
    }
  }

  componentWillMount = () => {
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({listType: 'vertical'});
    }
    //this.getList();
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
           actions={[<Popconfirm title="Remove song?" onConfirm={(e) => this.handleDelete(el.fbid, index)}><Button loading={el.isLoading}>{!el.isLoading && <Icon type="delete"/>}</Button></Popconfirm>]}
           extra={this.state.listType === 'vertical' ? <LazyLoad height={'100%'} overflow={true}><Img className="queue-image" src={el.thumbnails.medium.url} alt={`${el.videoId}-thumbnail`}/></LazyLoad> : null}>
          <List.Item.Meta
            avatar={this.state.listType === 'horizontal' ? <LazyLoad height={'100%'} overflow={true}><Img className="queue-image" src={el.thumbnails.medium.url} alt={`${el.videoId}-thumbnail`}/></LazyLoad> : null}
            title={<span className="truncate">{el.title}</span>}
            description={`${duration} | ${diff}`}
          />
          <p>Added by [insert name of adder here]</p>
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
          <Col span={24} className="right-align">
            <Pagination {...pagination}/>
          </Col>
        </Row>
        }
        <Row style={{marginTop: 10, maxHeight: '65vh', overflow: 'auto', padding: 8}}>
          <span ref={q => {this.queue = q}}></span>
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
