import React, { Component } from 'react';
import { Row, Col, Icon, Button, Progress, Card, Spin, Slider, Divider } from 'antd';
import Img from 'react-image';
import ReactPlayer from 'react-player';
import firebase from 'firebase';
import moment from 'moment';
import 'moment-duration-format';
const db = firebase.firestore();
const functions = firebase.functions();
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
    playerHeight: 300,
    np: null // now playing object
  }

  componentWillMount = () => {
    db.collection('rooms').doc('ABC').onSnapshot(doc => {
      if(!doc.data().np) this.setState({playerLoading: false});
      else {
        this.setState({np: doc.data().np, playerLoading: false});
      }
    })
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({playerHeight: 200});
    }
  }

  handleSlider = volume => {
    this.setState({volume});
  }

  // replace currently playing with the first item in queue
  handleSkip = () => {
    let overwrite = this.props.queuefirst;
    if(overwrite) overwrite.playing = this.state.playing;
    this.setState({playing: false, playerLoading: true, duration: null});
    let skip = functions.httpsCallable('handleSkip');
    skip({room: 'ABC', np: this.props.queuefirst}).then(res => {
      // If skip occured, remove first item from queue if there is anything in queue
      if(this.props.queuefirst) db.collection('rooms').doc('ABC').collection('queue').doc(this.props.queuefirst.fbid).delete();
      this.setState({playerLoading: false});
    }).catch(err => {
      this.setState({playerLoading: false});
      console.log(err);
    });
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
                    {this.state.np ?
                    <ReactPlayer
                      url={this.state.np.url}
                      ref={q => {this.player = q}}
                      style={{pointerEvents: 'none'}}
                      config={playerSettings}
                      onReady={() => this.setState({playerLoading: false})}
                      onDuration={(duration) => this.setState({duration})}
                      onProgress={(prog) => this.setState(prog)}
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
                    <Progress percent={this.state.played * 100 || 0} size="small" showInfo={false} />
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
                    <Button onClick={() => this.setState({playing: !this.state.playing})} style={{border: 'none'}} type="secondary" ghost={false}>
                      {this.state.playing ? <Icon type="pause"/> : <Icon type="caret-right"/>}
                    </Button>
                  </Col>
                  <Col xs={12} sm={12} md={4} className="center">
                    <Button disabled={this.state.np || this.props.queuefirst ? false: true} onClick={this.handleSkip} style={{border: 'none'}} type="secondary" ghost={false}>
                      <Icon type="step-forward"/>
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Spin>
          </Col>
          <Col sm={24} md={24} lg={10}>
            {this.state.np &&
            <Row type="flex" align="middle" justify="center" style={{marginTop: 15}}>
              <Col xs={24} className="center"><h3>Currently Playing</h3></Col>
              <Col xs={24} className="center">
                <h4>{this.state.np.title}</h4>
                <p>{this.state.np.channelTitle}</p>
              </Col>
              <Divider/>
            </Row>
            }
            {this.props.queuefirst &&
            <Row type="flex" align="middle" justify="center" gutter={16}>
              <Col xs={24} className="center"><h3>Next In Queue</h3></Col>
              <Col xs={24} sm={24} md={12} lg={6}>
                <Img className="responsive-img" src={this.props.queuefirst.thumbnails.medium.url} alt={`${this.props.queuefirst.videoId}-thumbnail`}/>
              </Col>
              <Col xs={24} sm={24} md={12} lg={12}>
                <div className="truncate">{this.props.queuefirst.title}</div>
                <div>{this.props.queuefirst.channelTitle} | {this.formatDuration(this.props.queuefirst.duration)}</div>
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
