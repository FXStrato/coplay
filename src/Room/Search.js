import React, { Component } from 'react';
import { Row, Col, Input, List, message, Spin, Button, Popconfirm, Modal, Progress, Icon } from 'antd';
import ProgressiveImage from 'react-progressive-image-loading';
import Img from 'react-image';
import LazyLoad from 'react-lazyload';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const SearchInput = Input.Search;
const db = firebase.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

class Search extends Component {


  state = {
    loading: false,
    value: null,
    data: null,
    durations: null,
    resultsLoad: false,
    loadedNumber: 0,
    modal: false,
    modalLoad: false,
    modalData: null,
    percent: 0,
    percentText: null,
  }

  renderList = (data, durations) => {
    if(data.items.length > 0 && durations.items.length > 0) {
      return data.items.map((el, index) => {
        let duration;
        if(durations.items[index]) duration = this.formatDuration(durations.items[index].contentDetails.duration);
        else duration = null;
        return (
          <List.Item key={`listitem-${index}`} className="center"
            actions={[<span>{el.snippet.channelTitle}</span>, <span>{duration ? duration : 'Playlist'}</span>]}
            extra={<LazyLoad height={'100%'} overflow={true}>
              <ProgressiveImage preview={el.snippet.thumbnails.medium.url} src={el.snippet.thumbnails.medium.url} render={(src, style) => <Img className="list-image list-shadow" style={style} src={src} alt={`${el.id.videoId}-thumbnail`}/>}/></LazyLoad>}>
            <List.Item.Meta
              title={<span>{el.snippet.title} {el.isAdded && <Icon className="animated fadeIn" type="check-circle"/>}</span>}
              description={el.snippet.description && el.snippet.description.substring(0, 100) + '...'}
            />
            <div>
              <Button loading={el.isLoading} onClick={el.id.kind.includes('playlist') ? () => this.handleModal(index, el.id.playlistId) : () => this.handleAdd(index)}>{el.id.kind.includes('playlist') ? 'Add Playlist' : 'Add To Queue'}</Button>
            </div>
          </List.Item>
        );
      });
    } else return null;
  }

  handleModal = (index, playlistId) => {
    let temp = this.state.data;
    temp.items[index].isLoading = true;
    this.setState({ data: temp });
    if(!this.state.modalData) {
      this.setState({modal: true});
      this.getPlaylist(playlistId, null).then(res => {
        res.index = index;
        res.playlistId = playlistId;
        temp.items[index].isLoading = false;
        temp.items[index].isAdded = false;
        this.setState({ data: temp, modalData: res});
        //console.log(res);
      })
    } else if(this.state.modalData && this.state.modalData.index !== index) {
      this.setState({modal: true, modalData: null});
      this.getPlaylist(playlistId, null).then(res => {
        res.index = index;
        res.playlistId = playlistId;
        temp.items[index].isLoading = false;
        temp.items[index].isAdded = false;
        this.setState({ data: temp, modalData: res });
        this.setState({});
        //console.log(res);
      })
    } else {
      this.setState({modal: true});
    }
  }

  handlePlaylistAdd = () => {
    this.setState({modalLoad: true, percent: 0});
    db.collection('rooms').doc(this.props.fbid).collection('queue').get().then(doc => {
      if(doc.size < 1000 && doc.size + this.state.modalData.pageInfo.totalResults <= 1000) {
        let user = firebase.auth().currentUser || null;
        this.playlistAddHelper(this.state.modalData.playlistId, this.state.modalData.nextPageToken, 0, user);
      } else {
        this.setState({modalLoad: false});
        message.error('Queue capacity reached, unable to add songs in playlist');
      }
    });
  }

  //TODO: Figure out how to batch add from playlist AND ALSO GET DURATIONS FOR EACH OF THE VIDEOS FUCK
  playlistAddHelper = (playlistId, nextPageToken, total, user) => {
    this.getPlaylist(playlistId, nextPageToken).then(res => {
      let totalpercent = res.pageInfo.totalResults;
      let cleanList = [];
      res.items.forEach(el => {
        if(el.snippet.description !== 'This video is unavailable.') cleanList.push(el);
      })
      res.items = cleanList;
      this.getDurations(res, true).then(dura => {
        this.handlePercent(Math.round(dura.items.length / 2), totalpercent);
        let batch = db.batch();
        //firebase.firestore.FieldValue.serverTimestamp()
        res.items.forEach((el, index) => {
          if(el.snippet.description !== 'This video is unavailable.') {
            let qRef = db.collection('rooms').doc(this.props.fbid).collection('queue').doc();
            batch.set(qRef, {
              url: 'https://www.youtube.com/watch?v=' + el.contentDetails.videoId + '&list=' + el.contentDetails.videoId,
              title: el.snippet.title,
              description: el.snippet.description,
              thumbnails: el.snippet.thumbnails,
              channelTitle: el.snippet.channelTitle,
              duration: dura.items[index].contentDetails.duration,
              videoId: el.contentDetails.videoId,
              timestamp: new Date(),
              adder: user ? user.displayName : 'Anon'
            });
            total++;
          }
        })
        batch.commit().then(() => {
          this.handlePercent(Math.round(dura.items.length / 2), totalpercent);
          if(nextPageToken) this.playlistAddHelper(playlistId, res.nextPageToken, total, user);
          else {
            setTimeout(() => {
              let temp = this.state.data;
              temp.items[this.state.modalData.index].isLoading = false;
              temp.items[this.state.modalData.index].isAdded = true;
              this.setState({ data: temp, modalLoad: false, modal: false});
              message.success(`${total} videos from ${this.state.data.items[this.state.modalData.index].snippet.title} added to queue`);
              return true;
            }, 500);
          }
        }).catch(err => {
          this.setState({modalLoad: false});
          message.error(`Error occurred uploading batch write, check console for more details`);
          console.log(err);
          return false;
        })
      }).catch(err => {
        this.setState({modalLoad: false});
        message.error(`Error occurred obtaining durations for playlist items`);
        console.log(err);
        return false;
      })
    })
  }

  handleAdd = (index) => {
    db.collection('rooms').doc(this.props.fbid).collection('queue').get().then(doc => {
      if(doc.size < 1000) {
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
          message.error(`${temp.items[index].snippet.title} unable to be added, check console for error`);
          console.log(err);
        });
      } else {
        message.error('Queue capacity reached, unable to add more videos');
      }
    })
  }

  handleSearch = (value) => {
    this.setState({ value, loading: true });
    this.getResults(value, null).then(res => {
      if (!res.error) {
        this.setState({ data: res });
        this.getDurations(res, false).then(res => {
          if (!res.error) {
            let newData = this.state.data;
            newData.items = newData.items.map((el) => {
              let elem = el;
              elem.isLoading = false;
              return elem;
            });
            res.items = newData.items.map((el, index) => {
              if(el.id.kind.includes('playlist')) return null;
              else return res.items[index];
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
            this.getDurations(res, false).then(response => {
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

  handlePercent = (increment, total) => {
    let percent = this.state.percent;
    let addition = Math.round(increment / total * 100);
    if(percent + addition > 100) percent = 100;
    else percent += addition;
    this.setState({percent});
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
      url += "&type=video,playlist";
      url += "&maxResults=50";
      url += "&q=" + value.trim().replace(" ", "+");
      const response = await fetch(url);
      return response.json();
    } catch (err) {
      console.log(err);
      //message.error('Unable to fetch data', err);
    }
  }

  async getDurations(data, playlist) {
    try {
      let idsStr = "";
      if(!playlist) {
        //Acquire list of youtube video ids from search
        data.items.forEach((el, index) => {
          if (index === data.items.length - 1) {
            idsStr += el.id.videoId;
          } else {
            idsStr += el.id.videoId + ",";
          }
        });
      } else {
        data.items.forEach((el, index) => {
          if (index === data.items.length - 1) {
            idsStr += el.contentDetails.videoId;
          } else {
            idsStr += el.contentDetails.videoId + ",";
          }
        });
      }

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

  async getPlaylist(value, token) {
    try {
      let url = "https://www.googleapis.com/youtube/v3/playlistItems";
      url += "?key=" + process.env.REACT_APP_YOUTUBEAPIKEY;
      if(token) url += "&pageToken=" + token;
      url += "&part=snippet,contentDetails";
      url += "&maxResults=50";
      url += "&playlistId=" + value.trim();
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
    const m = this.state.modalData;
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
        {this.state.data && this.state.modalData ?
        <Modal
          title="Adding playlist..."
          okText="Confirm"
          wrapClassName="vertical-center-modal"
          visible={this.state.modal}
          confirmLoading={this.state.modalLoad}
          onOk={this.handlePlaylistAdd}
          onCancel={() => this.setState({modal: false, modalData: false, percent: 0, modalLoad: false})}
        >
          <Row type="flex" justify="center" align="middle" gutter={16}>
            <Col xs={24} sm={24} md={12} lg={8}>
              <Img className="right responsive-img shadow" src={this.state.data.items[m.index].snippet.thumbnails.medium.url}/>
            </Col>
            <Col xs={24} sm={24} md={12} lg={8}>
              <p>{this.state.data.items[m.index].snippet.title}</p>
              <p>{this.state.data.items[m.index].snippet.channelTitle}</p>
            </Col>
          </Row>
          <Row style={{marginTop: 10}}>
            <Col span={24}>
              {m.pageInfo.totalResults < 50 ?
              <p className="center">Confirm adding {m.pageInfo.totalResults} video(s) to the playlist.</p>
              :
              <p className="center">There are {m.pageInfo.totalResults} videos that will be added to the playlist. Do you wish to continue?</p>
              }
            </Col>
          </Row>
          {this.state.modalLoad &&
          <Row style={{marginTop: 10}}>
            <Col span={24}>
              <div>{this.state.percentText}</div>
              <Progress percent={this.state.percent}/>
            </Col>
          </Row>
          }
        </Modal>
        :
        null
        }
      </div>
    );
  }
}

export default Search;
