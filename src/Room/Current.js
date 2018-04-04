import React, { Component } from 'react';
import { Row, Col, Icon, Button, Progress, Card, Spin, Slider } from 'antd';
import ReactPlayer from 'react-player';
const playerSettings = {
  youtube: {
    playerVars: {
      rel: 0,
      modestbranding: 1,
      showinfo: 1,
      enablejsapi: 1,
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
    playerHeight: 330,
  }

  componentWillMount = () => {
    if(window.innerWidth <= 768) {
      //Change tab to top
      this.setState({playerHeight: 200});
    }
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

  handleSlider = volume => {
    this.setState({volume});
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
                    <ReactPlayer
                      style={{pointerEvents: 'none'}}
                      config={playerSettings}
                      onReady={() => this.setState({playerLoading: false})}
                      onDuration={(duration) => this.setState({duration})}
                      onProgress={(prog) => this.setState(prog)}
                      volume={this.state.volume}
                      muted={this.state.muted}
                      url="https://www.youtube.com/watch?v=f1eMI0d-1Hs&index=18&list=RDQMafxMjeg1qBc"
                      playing={this.state.playing}
                      width="100%"
                      height={this.state.playerHeight} />
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
                    <Button style={{border: 'none'}} type="secondary" ghost={false}>
                      <Icon type="step-forward"/>
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Spin>
          </Col>
          <Col sm={24} md={24} lg={10}>
            <h3>Currently Playing</h3>
            <p>
              Room should have this functionality:
            </p>
            <ul>
              <li>Room owner should have complete control of room while they are in it, play/pause, skip or remove song, add song, etc.</li>
              <li>Option to go public, or stay private</li>
              <li>A queue, and also a history of played songs</li>
              <li>Display of number of people in room</li>
              <li>Potentially a chat system</li>
              <li>Must have an account to create a room</li>
            </ul>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Current;
