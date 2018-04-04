import React, { Component } from 'react';
import { Row, Col, Input, List, message, Spin, Button } from 'antd';
import ProgressiveImage from 'react-progressive-image-loading';
import Img from 'react-image';
import Lazy from 'react-lazy-load';
import moment from 'moment';
import 'moment-duration-format';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
import YTJson from '../youtube.json';
import DurationJson from '../durations.json';
const SearchInput = Input.Search;

class Search extends Component {

  state = {
    loading: false,
    value: null,
    data: YTJson,
    durations: DurationJson,
    resultsLoad: false,
    rowHeight: 170
  }

  componentWillMount = () => {
    if(window.innerWidth <= 768) {
      //Change list row height
      this.setState({rowHeight: 400});
    }
  }

  //Renders each item of the list
  renderItem = ({ index, key, style, isScrolling, isVisible }) => {
    const item = this.state.data.items[index];
    const duration = this.formatDuration(this.state.durations.items[index].contentDetails.duration);
    return (
      <List.Item key={key} style={style} className="center"
        actions={[<span>{item.snippet.channelTitle}</span>, <span>{duration}</span>]}
        extra={<Lazy offsetVertical={900} className="list-image">
          <ProgressiveImage preview={item.snippet.thumbnails.medium.url} src={item.snippet.thumbnails.medium.url} render={(src, style) => <Img className="responsive-img shadow" style={style} src={src} alt={`${item.id.videoId}-thumbnail`}/>}/></Lazy>}>
        <List.Item.Meta style={{marginLeft: -20}}
          title={item.snippet.title}
          description={item.snippet.description.substring(0, 100) + '...'}
        />
        <div>
          <Button>Add To Queue</Button>
        </div>
      </List.Item>
    );
  }

  handleSearch = (value) => {
    this.setState({ value });
    this.getResults(value);
  }

  handleScroll = scroll => {
    let pos = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
    if (pos <= 0) {
      console.log('Reached bottom of list');
      this.setState({ resultsLoad: true });
      // setTimeout(() => {
      //   let temp = this.state.data;
      //   temp.items = temp.items.concat(temp.items);
      //   this.setState({ resultsLoad: false, data: temp });
      // }, 1000);
    }
  }

  //Returns search results, need to get duration separately
  async getResults(value) {
    try {
      this.setState({loading: true, data: null, durations: null});
      let url = "https://www.googleapis.com/youtube/v3/search/";
      url += "?key=" + process.env.REACT_APP_YOUTUBEAPIKEY;
      url += "&part=snippet,id";
      url += "&type=video,playlist";
      url += "&maxResults=50";
      url += "&q=" + value.trim().replace(" ", "+");
      const response = await fetch(url);
      await response.json().then(res => {
        if (!res.error) {
          this.setState({ data: res });
          this.getDurations(res);
        } else {
          console.log(res);
          message.error(res.error.message);
        }
      }).catch(err => {
        message.error(err);
      });
    } catch (err) {
      message.error('Unable to fetch data', err);
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
      url += "&id=" + idsStr;
      const response = await fetch(url);
      await response.json().then(res => {
        if (!res.error) {
          this.setState({durations: res, loading: false});
          console.log(res);
        } else {
          console.log(res);
          message.error(res.error.message);
        }
      }).catch(err => {
        message.error(err);
      });
    } catch (err) {
      message.error('Unable to fetch data', err);
    }
  }

  formatDuration = (d) => {
    if(d === "PT0S") return "LIVE";
    return moment.duration(d).format('HH:mm:ss');
  }

  render() {
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
        <Row style={{marginTop: 10}}>
          <Col xs={24}>
            <Spin spinning={this.state.loading}>
              {this.state.data && this.state.durations ?
                <List bordered={true} itemLayout="vertical">
                  <WindowScroller scrollElement={null}>
                    {({ height, isScrolling, onChildScroll, scrollTop }) => (
                      <AutoSizer disableHeight={true}>
                        {({ width, height, isScrolling, onChildScroll, scrollTop }) => (<VList
                          autoHeight={true}
                          width={width}
                          isScrolling={isScrolling}
                          onScroll={this.handleScroll}
                          scrollTop={scrollTop}
                          height={510}
                          rowCount={this.state.data.items.length}
                          overscanRowCount={3}
                          rowHeight={this.state.rowHeight}
                          rowRenderer={this.renderItem}
                        />)}
                      </AutoSizer>
                    )}
                  </WindowScroller>
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
