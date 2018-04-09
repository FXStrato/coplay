import React, { Component } from 'react';
import { Row, Col, Icon, Button, Progress, Card, Spin, Slider, Divider } from 'antd';
import ReactPlayer from 'react-player';
import Img from 'react-image';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const db = firebase.firestore();
const playerSettings = {
  youtube: {
    playerVars: {
      rel: 0,
      modestbranding: 1,
      showinfo: 1,
      controls: 0
    },
    preload: true
  }
}


class Current extends Component {

  state = {
    playerLoading: true,
    playing: false,
    duration: null,
    played: null,
    loaded: null,
    volume: 0.5,
    muted: false,
    initialSeek: false,
    playerHeight: 300,
    next: null,
    np: {} // now playing object
  }

  componentWillMount = () => {
    this.queueRef = db.collection("rooms").doc("ABC").collection("queue").orderBy('timestamp', 'asc').onSnapshot(snap => {
      if (snap.docs.length > 0) {
        this.setState({ next: snap.docs[0].data(), loading: false });
      } else {
        this.setState({ next: null });
      }
    })
    this.npRef = db.collection('rooms').doc('ABC').collection('np').doc('np').onSnapshot(doc => {
      if (doc.exists) {
        this.setState({ np: doc.data(), played: doc.data().seek || 0, playerLoading: false });
      } else this.setState({ playerLoading: false });
    })
    if (window.innerWidth <= 768) {
      //Change tab to top
      this.setState({ playerHeight: 200 });
    }
  }

  componentWillUnmount = () => {
    this.queueRef();
    this.npRef();
  }

  handleSlider = volume => {
    this.setState({ volume });
  }

  handleReady = () => {
    this.setState({ playerLoading: false, played: this.state.np.seek, playing: this.state.np.playing });
  }

  handlePlay = () => {
    if(this.player && this.state.np.seek > 0 && !this.state.initialSeek) this.player.seekTo(this.state.np.seek);
    let temp = this.state.np;
    temp.playing = true;
    temp.seek = this.state.played;
    db.collection('rooms').doc('ABC').collection('np').doc('np').update(temp);
    this.setState({ playing: true, initialSeek: true });
  }

  handlePause = () => {
    let temp = this.state.np;
    temp.playing = false;
    temp.seek = this.state.played;
    db.collection('rooms').doc('ABC').collection('np').doc('np').update(temp);
    this.setState({ playing: false });
  }

  handleProgress = (prog) => {
    if(this.state.playing) this.setState(prog);
  }

  // replace currently playing with the first item in queue
  handleSkip = () => {
    let np = this.state.np;
    let currentPlaying = this.state.playing;
    this.setState({ playing: false, playerLoading: true, duration: null, played: 0 });
    db.collection('rooms').doc('ABC').collection('queue').orderBy('timestamp', 'asc').limit(1).get().then(snap => {
      if (snap.docs.length > 0) {
        let temp = snap.docs[0].data();
        temp.playing = currentPlaying;
        temp.seek = 0;
        db.collection('rooms').doc('ABC').collection('np').doc('np').set(temp).then(res => {
          db.collection('rooms').doc('ABC').collection('queue').doc(snap.docs[0].id).delete().then(res => {
            this.setState({ playerLoading: false });
          }).catch(err => {
            this.setState({ playerLoading: false });
            console.log(err);
          });
        }).catch(err => {
          this.setState({ playerLoading: false });
          console.log(err);
        });
      } else {
        db.collection('rooms').doc('ABC').collection('np').doc('np').set({}).then(res => {
          this.setState({ playerLoading: false });
        });
      }
      db.collection('rooms').doc('ABC').collection('history').add(np);
    })
  }

  format = (seconds) => {
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = this.pad(date.getUTCSeconds())
    if (hh) {
      return `${hh}:${this.pad(mm)}:${ss}`
    }
    return `${mm}:${ss}`
  }

  pad = (string) => {
    return ('0' + string).slice(-2)
  }

  formatDuration = (d) => {
    if (d === "PT0S") return "LIVE";
    return moment.duration(d).format('H:mm:ss');
  }

  render() {
    return (
      <div>
        <Row gutter={16}>
          <Col sm={24} md={24} lg={14}>
            <Spin spinning={this.state.playerLoading}>
              <Card bordered={false} style={{marginTop: -15}}>
                <Row>
                  <Col sm={24}>
                    {Object.keys(this.state.np).length > 0 ?
                    <ReactPlayer
                      url={this.state.np.url}
                      ref={q => {this.player = q}}
                      style={{pointerEvents: 'none'}}
                      config={playerSettings}
                      onReady={this.handleReady}
                      onDuration={(duration) => this.setState({duration})}
                      onProgress={this.handleProgress}
                      onPlay={this.handlePlay}
                      onPause={this.handlePause}
                      onEnded={this.handleSkip}
                      onError={e => console.log('onError', e)}
                      volume={this.state.volume}
                      muted={this.state.muted}
                      playing={this.state.playing}
                      width="100%"
                      height={this.state.playerHeight} />
                    :
                    <div style={{height: this.state.playerHeight}}></div>
                    }
                  </Col>
                  <Col sm={24} className="center">
                    <Progress percent={this.state.played * 100} size="small" showInfo={false} />
                  </Col>
                </Row>
                <Row style={{marginBottom: 0}}>
                  <Col xs={12}>
                    <p className="left-align">{this.format(this.state.duration * this.state.played)}</p>
                  </Col>
                  <Col xs={12}>
                    <p className="right-align">{this.format(this.state.duration)}</p>
                  </Col>
                </Row>
                <Row>
                  <Col xs={24} sm={12} md={{offset: 4, span: 4}} className="center">
                    <Button onClick={() => this.setState({muted: !this.state.muted})} style={{border: 'none'}} type="secondary" ghost={false}>
                      {this.state.muted ?
                      <i className="material-icons" style={{verticalAlign: 'middle'}}>volume_off</i>
                      :
                      <i className="material-icons" style={{verticalAlign: 'middle'}}>{this.state.volume > 0.3 ? 'volume_up' : 'volume_down'}</i>
                      }
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={4} className="center">
                    <Slider min={0} max={1} step={0.01} tipFormatter={null} defaultValue={this.state.volume} onChange={this.handleSlider} style={{width: '100%', display: 'inline-block', verticalAlign: 'middle', marginLeft: -5}} />
                  </Col>
                  <Col xs={12} sm={12} md={4} className="center">
                    <Button disabled={Object.keys(this.state.np).length > 0 || this.state.playerLoading ? false : true} onClick={() => this.setState({playing: !this.state.playing})} style={{border: 'none'}} type="secondary" ghost={false}>
                      {this.state.playing ? <Icon type="pause"/> : <Icon type="caret-right"/>}
                    </Button>
                  </Col>
                  <Col xs={12} sm={12} md={4} className="center">
                    <Button disabled={Object.keys(this.state.np).length > 0 || this.state.next || this.state.playerLoading ? false : true} onClick={this.handleSkip} style={{border: 'none'}} type="secondary" ghost={false}>
                      <Icon type="step-forward"/>
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Spin>
          </Col>
          <Col sm={24} md={24} lg={10}>
            {Object.keys(this.state.np).length > 0 &&
            <Row type="flex" align="middle" justify="center" style={{marginTop: 15}}>
              <Col xs={24} className="center"><h3>Currently Playing</h3></Col>
              <Col xs={24} className="center">
                <h4>{this.state.np.title}</h4>
                <p>{this.state.np.channelTitle}</p>
              </Col>
              <Divider/>
            </Row>
            }
            {this.state.next &&
            <Row type="flex" justify="center" align="middle" gutter={16}>
              <Col xs={24} className="center"><h3>Next In Queue</h3></Col>
              <Col xs={24} sm={24} md={8} lg={4}>
                <Img className="responsive-img" src={this.state.next.thumbnails.medium.url}/>
              </Col>
              <Col xs={24} sm={24} md={14} lg={10}>
                <div className="truncate">{this.state.next.title}</div>
                <div>{this.state.next.channelTitle}</div>
              </Col>
            </Row>
            }
          </Col>
        </Row>
      </div>
    );
  }
}

export default Current;
