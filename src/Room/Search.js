import React, { Component } from 'react';
import { Row, Col, Input, List, message, Spin, Button, Popconfirm } from 'antd';
import ProgressiveImage from 'react-progressive-image-loading';
import Img from 'react-image';
import LazyLoad from 'react-lazyload';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const SearchInput = Input.Search;
const db = firebase.firestore();

class Search extends Component {


  state = {
    loading: false,
    value: null,
    data: null,
    durations: null,
    resultsLoad: false,
    loadedNumber: 0
  }

  renderList = (data, durations) => {
    if(data.items.length > 0 && durations.items.length > 0) {
      return data.items.map((el, index) => {
        let duration = this.formatDuration(durations.items[index].contentDetails.duration);
        return (
          <List.Item key={`listitem-${index}`} className="center"
            actions={[<span>{el.snippet.channelTitle}</span>, <span>{duration}</span>]}
            extra={<LazyLoad height={'100%'} overflow={true}>
              <ProgressiveImage preview={el.snippet.thumbnails.medium.url} src={el.snippet.thumbnails.medium.url} render={(src, style) => <Img className="list-image list-shadow" style={style} src={src} alt={`${el.id.videoId}-thumbnail`}/>}/></LazyLoad>}>
            <List.Item.Meta
              title={el.snippet.title}
              description={el.snippet.description.substring(0, 100) + '...'}
            />
            <div>
              <Button loading={el.isLoading} onClick={() => this.handleAdd(index)}>Add To Queue</Button>
            </div>
          </List.Item>
        );
      });
    } else return null;
  }

  handleAdd = (index) => {
    let user = firebase.auth().currentUser || null;
    let temp = this.state.data;
    temp.items[index].isLoading = true;
    this.setState({ data: temp });
    db.collection("rooms").doc(this.props.fbid).collection("queue").add({
      url: 'https://www.youtube.com/watch?v=' + temp.items[index].id.videoId + '&list=' + temp.items[index].id.videoId,
      title: temp.items[index].snippet.title,
      description: temp.items[index].snippet.description,
      thumbnails: temp.items[index].snippet.thumbnails,
      channelTitle: temp.items[index].snippet.channelTitle,
      videoId: temp.items[index].id.videoId,
      duration: this.state.durations.items[index].contentDetails.duration,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      adder: user ? user.displayName : 'Anon'
    }).then(ref => {
      temp.items[index].isLoading = false;
      temp.items[index].isAdded = true;
      this.setState({ data: temp });
      message.success(`${temp.items[index].snippet.title} added to queue`);
    }).catch(err => {
      temp.items[index].isLoading = false;
      temp.items[index].isAdded = false;
      this.setState({ data: temp });
      message.success(`${temp.items[index].snippet.title} unable to be added, check console for error`);
      console.log(err);
    });
  }

  handleSearch = (value) => {
    this.setState({ value, loading: true });
    this.getResults(value, null).then(res => {
      if (!res.error) {
        this.setState({ data: res });
        this.getDurations(res).then(res => {
          if (!res.error) {
            let newData = this.state.data;
            newData.items = newData.items.map((el) => {
              let elem = el;
              elem.isLoading = false;
              return elem;
            });
            this.setState({ durations: res, loading: false, data: newData });
            this.renderList(this.state.data, res);
          } else {
            console.log(res);
            message.error(res.error.message);
          }
        }).catch(err => {
          console.log(err);
          //message.error(err);
        });
      } else {
        console.log(res);
        message.error(res.error.message);
      }
    }).catch(err => {
      console.log(err);
      //message.error(err);
    });
  }

  handleScroll = e => {
    if (this.state.data) {
      const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
      if (bottom && this.state.loadedNumber <= 4 && !this.state.resultsLoad) {
        let temp = this.state.loadedNumber;
        temp++;
        this.setState({ resultsLoad: true, loadedNumber: temp });
        this.getResults(this.state.value, this.state.data.nextPageToken).then(res => {
          if (!res.error) {
            let newData = this.state.data;
            newData.nextPageToken = res.nextPageToken;
            newData.items = newData.items.concat(res.items);
            this.getDurations(res).then(response => {
              if (!response.error) {
                let newDurations = this.state.durations;
                newDurations.items = newDurations.items.concat(response.items);
                this.setState({ durations: newDurations, resultsLoad: false, data: newData });
                this.renderList(newData, newDurations);
              } else {
                console.log(res);
                message.error(res.error.message);
              }
            }).catch(err => {
              console.log(err);
              //message.error(err);
            });
          } else {
            console.log(res);
            message.error(res.error.message);
          }
        }).catch(err => {
          console.log(err);
          //message.error(err);
        });
      }
    }
  }

  handleDelete = () => {
    this.setState({data: null, durations: null, loadedNumber: 0})
  }

  //Returns search results, need to get duration separately
  async getResults(value, token) {
    try {
      if (!token) this.setState({ loading: true, data: null, durations: null, list: [] });
      let url = "https://www.googleapis.com/youtube/v3/search/";
      url += "?key=" + process.env.REACT_APP_YOUTUBEAPIKEY;
      url += "&part=snippet,id";
      if (token) url += "&pageToken=" + token;
      url += "&type=video";
      url += "&maxResults=50";
      url += "&q=" + value.trim().replace(" ", "+");
      const response = await fetch(url);
      return response.json();
    } catch (err) {
      console.log(err);
      //message.error('Unable to fetch data', err);
    }
  }

  async getDurations(data) {
    try {
      //Acquire list of youtube video ids from search
      let idsStr = "";
      data.items.forEach((el, index) => {
        if (index === data.items.length - 1) {
          idsStr += el.id.videoId;
        } else {
          idsStr += el.id.videoId + ",";
        }
      });
      let url = "https://www.googleapis.com/youtube/v3/videos";
      url += "?key=" + process.env.REACT_APP_YOUTUBEAPIKEY;
      url += "&part=contentDetails";
      url += "&maxResults=50";
      url += "&id=" + idsStr;
      const response = await fetch(url);
      return response.json();
    } catch (err) {
      console.log(err);
      //message.error('Unable to fetch data', err);
    }
  }

  formatDuration = (d) => {
    if (d === "PT0S") return "LIVE";
    return moment.duration(d).format('H:mm:ss');
  }

  render() {

    let list;
    if (this.state.data && this.state.data.items.length > 0 && this.state.durations && this.state.durations.items.length > 0 && this.state.durations.items.length === this.state.data.items.length) list = this.renderList(this.state.data, this.state.durations);

    return (
      <div>
        <Row type="flex" justify="center" gutter={16}>
          <Col xs={24} sm={24} md={18} lg={12}>
            <SearchInput
              placeholder="Search by keyword"
              onSearch={this.handleSearch}
              enterButton={true}
              disabled={this.state.loading}
            />
          </Col>
        </Row>
        {this.state.data && this.state.durations ?
        <Row>
          <Col span={24}>
            <Popconfirm title="Clear search?" onConfirm={this.handleDelete}><Button className="right"><i className="material-icons" style={{verticalAlign: 'middle'}}>clear_all</i></Button></Popconfirm>
          </Col>
        </Row>
        :
        null}
        <Row onScroll={this.handleScroll} style={{marginTop: 10, maxHeight: '65vh', overflow: 'auto', padding: 8}}>
          <Col span={24}>
            <Spin spinning={this.state.loading} className="center" style={{width: '100%'}}>
              {this.state.data && this.state.durations ?
                <List itemLayout="vertical">
                  {list}
                </List>
                :
                null}
            </Spin>
          </Col>
          <Col xs={24}>
            <Spin spinning={this.state.resultsLoad}>
              <div style={{height: 25}}></div>
            </Spin>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Search;
