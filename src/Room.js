import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'moment';
import firebase from 'firebase';
import ReactPlayer from 'react-player';
import Slider from 'rc-slider';

class Room extends Component {

  state = {
    room: this.props.match.params.roomID,
    uid: null,
    isAdmin: false,
    isOwner: false,
    isPublic: null,
    open: false,
    volume: 0.5,
    playerReady: false,
    playing: false,
    initPlaying: false,
    url: "",
    nowPlaying: null,
    timeresults: [],
    results: [],
    formattedResults: [],
    formattedQueue: [],
    formattedHistory: [],
    queueConfirmAll: false,
    historyConfirmAll: false,
    searchinput: "",
    searchloading: false,
    selectloadingindex: -1,
    deleteModal: false,
    publicModal: false,
  }

  componentWillMount = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({uid: user.uid});
        firebase.database().ref('room/' + this.state.room).once('value').then((snapshot) => {
          if(snapshot.val()) {
            this.setState({isPublic: snapshot.val().isPublic});
          }
        });
        firebase.database().ref('associations/' + user.uid).once('value').then((snapshot) => {
          if(snapshot.val()) {
            let isAdmin = false;
            if(snapshot.val().ownRoom === this.state.room) {
              this.setState({isOwner: true});
              isAdmin = true;
            }
            if(snapshot.val().rooms) {
              if(snapshot.val().rooms[this.state.room]) isAdmin = true;
            }
            this.setState({isAdmin: isAdmin});
          }
        });
        // ...
      } else {
        // User is signed out.
        // ...
      }
      // ...
    });
  }

  componentDidMount = () => {
    document.getElementById("default-tab").click();
    this.roomRef = firebase.database().ref('room/' + this.state.room);
    this.queueRef = firebase.database().ref('room/' + this.state.room + '/queue');
    this.historyRef = firebase.database().ref('room/' + this.state.room + '/history');
    this.nowPlayingRef = firebase.database().ref('room/' + this.state.room + '/nowplaying');
    this.nowPlayingRef.once('value').then((snapshot) => {
      if(!snapshot.val()) {
        this.handleSongEnd();
      } else {
        if(this.state.isOwner && snapshot.val().playing) {
          //Set it to false, since it got loaded and admin should control when it begins and stops
          firebase.database().ref('room/' + this.state.room + '/nowplaying').update({
            id: snapshot.val().id,
            title: snapshot.val().title,
            duration : snapshot.val().duration,
            thumbnail: snapshot.val().thumbnail,
            playedSeconds: snapshot.val().playedSeconds,
            playing: false,
          });
        }
        let temp = "https://www.youtube.com/v/" + snapshot.val().id + "?playlist=" + snapshot.val().id + "&autoplay=1&rel=0";
        this.setState({url: temp, nowPlaying: snapshot.val()});
      }
    });
    //Set listener on nowPlaying, just check for if it's playing or not (for non admins)
    this.nowPlayingRef.on('value', (snapshot) => {
      if(snapshot.val()) {
        let temp = "https://www.youtube.com/v/" + snapshot.val().id + "?playlist=" + snapshot.val().id + "&autoplay=1&rel=0";
        this.setState({url: temp, playing: snapshot.val().playing, nowPlaying: snapshot.val()})
      } else {
        //no more song in nowPlaying, clear it out
        this.setState({url: null, nowPlaying: null, playing: false})
      }
    })
    //Listener for queue; update it whenever someone adds songs
    this.queueRef.on('value', (snapshot) => {
      this.getQueueList(snapshot.val());
    })

    this.historyRef.on('value', (snapshot) => {
      this.getHistoryList(snapshot.val());
    })

    this.roomRef.on('value', (snapshot) => {
      if(!snapshot.val()) {
        this.props.history.push('/');
      }
    })
  }

  componentWillUnmount = () => {
    if(this.state.isOwner && this.state.nowPlaying) {
      firebase.database().ref('room/' + this.state.room + '/nowplaying').update({
        id: this.state.nowPlaying.id,
        title: this.state.nowPlaying.title,
        duration : this.state.nowPlaying.duration,
        thumbnail: this.state.nowPlaying.thumbnail,
        playedSeconds: this.state.nowPlaying.playedSeconds,
        playing: false,
      });
    }
    this.nowPlayingRef.off();
    this.queueRef.off();
    this.historyRef.off();
    this.roomRef.off();
  }

  ref = player => {
    this.player = player;
  }

  openTab = (event, tab) => {
    let i, content, links;
    // Get all elements with class="tabcontent" and hide them
   content = document.getElementsByClassName("tab-content");
   for (i = 0; i < content.length; i++) {
       content[i].style.display = "none";
   }

   // Get all elements with class="tablinks" and remove the class "active"
   links = document.getElementsByClassName("tab-links");
   for (i = 0; i < links.length; i++) {
       links[i].className = links[i].className.replace(" is-active", "");
   }

   // Show the current tab, and add an "active" class to the button that opened the tab
   document.getElementById(tab).style.display = "block";
   event.currentTarget.className += " is-active";

   if(tab === "q") {
     firebase.database().ref('room/' + this.state.room + '/queue').once('value').then((snapshot) => {
       if(snapshot.val()) {
         this.getQueueList(snapshot.val());
       }
     });
   } else if(tab === "h") {
     firebase.database().ref('room/' + this.state.room + '/history').once('value').then((snapshot) => {
       if(snapshot.val()) {
         this.getHistoryList(snapshot.val());
       }
     });
   }
  }

  //Save input value to state
  handleChange = (event) => {
    this.setState({searchinput: event.target.value})
  }

  //Query for list of videos based on search text
  handleSearch = (event) => {
    this.setState({searchloading: true});
    event.preventDefault();
    fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAtSE-0lZOKunNlkHt8wDJk9w4GjFL9Fu4&type=video&maxResults=15&q=' + this.state.searchinput).then((response) => {
      return response.json().then((data) => {
        //Create string of video id's
        if(data.items.length > 0) {
          this.setState({results: data.items});
          let idstring = data.items[0].id.videoId;
          for(let i = 1; i < data.items.length; i++) {
             idstring += "," + data.items[i].id.videoId;
          }
          fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyAtSE-0lZOKunNlkHt8wDJk9w4GjFL9Fu4&id=' + idstring).then((response) => {
            return response.json().then((data) => {
              let temp;
              for(let i = 0; i < this.state.results.length; i++) {
                temp = this.state.results;
                let hours = moment.duration(data.items[i].contentDetails.duration).hours() === 0 ? "" : moment.duration(data.items[i].contentDetails.duration).hours() + ":";
                let minutes = moment.duration(data.items[i].contentDetails.duration).minutes() === 0 ? "" : moment.duration(data.items[i].contentDetails.duration).minutes() + ":";
                let seconds = moment.duration(data.items[i].contentDetails.duration).seconds() < 10 ? "0" + moment.duration(data.items[i].contentDetails.duration).seconds() : moment.duration(data.items[i].contentDetails.duration).seconds();
                temp[i].duration = hours + minutes + seconds;
              }
              this.setState({timeresults: temp});
              this.formatSearchList(temp);
            })
          })
        }

      });
    }).catch((err) => {
      console.log('Error obtaining search results', err);
    })
  }

  handleDelete = (type, id) => {
    if(type === 'q') {
      //Means its deleting from queue
      firebase.database().ref('room/' + this.state.room + '/queue/' + id).remove();
    } else {
      firebase.database().ref('room/' + this.state.room + '/history/' + id).remove();
    }
  }

  handleDeleteAll = (type) => {
    if(type === 'q') {
      firebase.database().ref('room/' + this.state.room + '/queue/').remove();
      this.setState({queueConfirmAll: false});
    } else {
      firebase.database().ref('room/' + this.state.room + '/history/').remove();
      this.setState({historyConfirmAll: false});
    }
  }

  //Update firebase with progress of the now playing song
  handleProgress = (data) => {
    if(this.state.isAdmin) {
      if(this.state.playing) {
        let nowPlaying = {
          id: this.state.nowPlaying.id,
          title: this.state.nowPlaying.title,
          duration : this.state.nowPlaying.duration,
          thumbnail: this.state.nowPlaying.thumbnail,
          playedSeconds: data.playedSeconds,
          playing: true,
        }
        let updates = {};
        updates['room/' + this.state.room + '/nowplaying/'] = nowPlaying;
        this.setState({nowPlaying: nowPlaying});
        return firebase.database().ref().update(updates);
      }
    }
  }

  handlePlay = (play) => {
    if(!this.state.initPlaying) {
      this.setState({initPlaying: true});
      this.player.seekTo(parseFloat(this.state.nowPlaying.playedSeconds));
    }
    let isPlaying = true;
    if(play === "toggle") {
      if(this.state.playing) {
        isPlaying = false;
      }
      this.setState({playing: !this.state.playing});
    } else {
      isPlaying = play;
      this.setState({playing: play});
    }
    firebase.database().ref('room/' + this.state.room + '/nowplaying').update({
      id: this.state.nowPlaying.id,
      title: this.state.nowPlaying.title,
      duration : this.state.nowPlaying.duration,
      thumbnail: this.state.nowPlaying.thumbnail,
      playedSeconds: this.state.nowPlaying.playedSeconds,
      playing: isPlaying,
    });
  }

  //Add to queue; if nowplaying is empty, add whatever was queued to nowplaying
  handleSelect = (id, title, duration, thumbnail, index) => {
    //TODO: Show notification telling what song got added, and then hide it again using a timeout
    this.setState({selectloadingindex: index});
    firebase.database().ref('room/' + this.state.room + '/queue/').push({
      id: id,
      title: title,
      duration : duration,
      thumbnail: thumbnail,
      playedSeconds: 0,
    }).then(() => {
      //This bit forces the search results to show loading on the clicked item, and then reset it back to being able to be added
      this.formatSearchList(this.state.timeresults);
      this.setState({selectloadingindex: -1});
      setTimeout(() => {
        this.formatSearchList(this.state.timeresults);
      }, 600)

      firebase.database().ref('room/' + this.state.room + '/nowplaying').once('value').then((snapshot) => {
        if(!snapshot.val()) {
          this.handleSongEnd();
        }
      });
    });
  }

  handleNowPlaying = (nowPlaying) => {
    if(!nowPlaying) console.log('nowPlaying is null');
    else {
      //If it's not null, it means it's being updated; so don't do anything with it just yet
      console.log(nowPlaying);
    }
  }

  handleVolume = (value) => {
    this.setState({volume: value});
  }

  //Remove whatever is in now playing, replace with first thing from queue, remove from queue, add to history, and
  //then begin song
  handleSongEnd = () => {
    if(this.state.isAdmin) {
      firebase.database().ref('room/' + this.state.room + '/nowplaying').remove();
      //Acquire first thing from queue
      let queueItem;
      let queueID;
      firebase.database().ref('room/' + this.state.room + '/queue').once('value').then((snapshot) => {
        if(snapshot.val()) {
          //Make sure there's something in the queue
          queueItem = snapshot.val()[Object.keys(snapshot.val())[0]];
          queueID = Object.keys(snapshot.val())[0];
          queueItem.isPlaying = true;
          firebase.database().ref('room/' + this.state.room + '/nowplaying').update({
            id: queueItem.id,
            title: queueItem.title,
            duration : queueItem.duration,
            thumbnail: queueItem.thumbnail,
            playedSeconds: queueItem.playedSeconds,
            playing: true,
          }).then(() => {
            //Now remove song from queue
            console.log('Successfully added first song in queue to now playing');
            firebase.database().ref('room/' + this.state.room + '/queue/' + queueID).remove();
            //Add song to history
            firebase.database().ref('room/' + this.state.room + '/history/').push({
              id: queueItem.id,
              title: queueItem.title,
              duration : queueItem.duration,
              thumbnail: queueItem.thumbnail,
            });
            //Create url for ReactPlayer
            let temp = "https://www.youtube.com/v/" + queueItem.id + "?playlist=" + queueItem.id + "&autoplay=1&rel=0";
            this.setState({url: temp, nowPlaying: queueItem, nowPlayingKey: queueID});
          })
        } else {
          //if nothing in queue, display helper text to add stuff to queue to play songs
          this.setState({url: null, nowPlaying: null, nowPlayingKey: null});
        }
      });
    }
  }

  handleRoomDelete = () => {
    //remove association bits too
    firebase.database().ref('associations/' + this.state.uid + '/ownRoom').remove();
    firebase.database().ref('list/' + this.state.room).remove();
    //remove from public list
    firebase.database().ref('room/' + this.state.room).remove();
    this.props.history.push('/');
  }

  handlePublic = () => {
    if(!this.state.isPublic) {
      //add to public list
      firebase.database().ref('room/' + this.state.room).set({
        isPublic: true
      }).then(() => {
        firebase.database().ref('list/' + this.state.room).update({
          isPublic: true
        });
      });
      this.setState({isPublic: true});
    } else {
      //remove from public list
      firebase.database().ref('room/' + this.state.room).set({
        isPublic: false
      }).then(() => {
        firebase.database().ref('list/' + this.state.room).remove();
      });
      this.setState({isPublic: false});
    }
    this.setState({publicModal: false});
  }

  handlePlayerError = error => {
    console.log(error);
  }

  //Formate the results to display nicely within a table
  formatSearchList = (data) => {
    let results = _.map(data, (el, index) => {
      return (
        <tr key={el.id.videoId}>
          <td>
            <div className="columns">
              <div className="column image">
                <img src={el.snippet.thumbnails.medium.url} alt={el.id.videoId + '-thumbnail'}/>
              </div>
              <div className="column">
                {el.snippet.title} <br/>
                {el.duration}
              </div>
              <div className="column has-text-centered">
                <a className={this.state.selectloadingindex === index ? "button is-uppercase is-loading is-disabled" : "button is-uppercase"} onClick={() => this.handleSelect(el.id.videoId, el.snippet.title, el.duration, el.snippet.thumbnails.default.url, index)}>Add To Queue</a>
              </div>
            </div>
          </td>
        </tr>
      )
    })
    this.setState({formattedResults: results, searchloading: false});
  }

  getQueueList = (data) => {
    let results = _.map(data, (el, index, name) => {
      return (
        <tr key={'queue-' + el.id + '-' + index}>
          <td>
            <nav className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="image">
                    <img src={el.thumbnail} alt={el.id + '-thumbnail'}/>
                  </div>
                </div>
                <div className="level-item">
                  {el.title} <br/>
                  {el.duration}
                </div>
              </div>
              <div className="level-right">
                {this.state.isAdmin &&
                <div className="level-item">
                  <a className="button" onClick={() => this.handleDelete('q', Object.keys(name)[0])}><i className="fa fa-trash"></i></a>
                </div>
                }
              </div>
            </nav>
          </td>
        </tr>
      )
    })
    this.setState({formattedQueue: results});
  }

  getHistoryList = (data) => {
    let results = _.map(data, (el, index) => {
      return (
        <tr key={'history-' + el.id + '-' + index}>
          <td>
            <nav className="level">
              <div className="level-left">
                <div className="level-item">
                  <div className="image">
                    <img src={el.thumbnail} alt={el.id + '-thumbnail'}/>
                  </div>
                </div>
                <div className="level-item">
                  {el.title} <br/>
                  {el.duration}
                </div>
              </div>
              <div className="level-right">
                {this.state.isAdmin &&
                <div className="level-item">
                  <a className="button" onClick={() => this.handleDelete('h', el.id)}><i className="fa fa-trash"></i></a>
                </div>
                }
              </div>
            </nav>
          </td>
        </tr>
      )
    })
    this.setState({formattedHistory: _.reverse(results)});
  }

  render() {
    return (
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              {this.state.isOwner &&
              <nav className="level">
                <div className="level-left"></div>
                <div className="level-right">
                  <div className="level-item">
                    {this.state.isPublic !== null ?
                      <button className={this.state.isPublic ? "button is-dark" : "button is-primary"} onClick={() => this.setState({publicModal: true})}>{this.state.isPublic ? 'Go Private' : 'Go Public'}</button>
                    :
                    null
                    }
                  </div>
                  <div className="level-item">
                    <a className="delete is-large" onClick={() => this.setState({deleteModal: true})}></a>
                  </div>
                </div>
              </nav>
              }
            </div>
          </div>
          <div className="columns">
            <div className="column">
              <nav className="level">
                <div className="level-left"></div>
                <div className="level-right">
                  <div className="level-item">
                    <div className="field is-grouped is-grouped-multiline">
                      {this.state.uid &&
                      <div className="control">
                        <div className="tags has-addons">
                          <span className="tag is-dark">status</span>
                          <span className="tag is-success">validated</span>
                        </div>
                      </div>
                      }
                      {this.state.isPublic !== null &&
                      <div className="control">
                        <div className="tags has-addons">
                          <span className="tag is-dark">visibility</span>
                          <span className="tag is-light">{this.state.isPublic ? 'public' : 'private'}</span>
                        </div>
                      </div>
                      }
                        {this.state.isAdmin &&
                        <div className="control">
                          <div className="tags has-addons">
                            <span className="tag is-dark">level</span>
                            <span className="tag is-info">{this.state.isOwner ? 'owner' : 'admin'}</span>
                          </div>
                        </div>
                        }
                    </div>
                  </div>
                </div>
              </nav>

            </div>
          </div>
          <div className="columns">
            <div className="column">
              <div className="tabs">
                <ul>
                  <li id="default-tab" className="tab-links" onClick={(e) => this.openTab(e, 'np')}><a>Now Playing</a></li>
                  <li className="tab-links" onClick={(e) => this.openTab(e, 'q')}><a>Queue {this.state.formattedQueue.length > 0 && <span style={{marginLeft: 5}} className="tag is-light">{this.state.formattedQueue.length}</span>}</a></li>
                  <li className="tab-links" onClick={(e) => this.openTab(e, 'h')}><a>History</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div id="np" className="tab-content">
            <div className="columns">
              <div className="column">
                {this.state.nowPlaying &&
                <nav className="level">
                  <div className="level-left">
                    <div className="level-item">
                      {this.state.nowPlaying.title} <br/>
                      {this.state.nowPlaying.duration}
                    </div>
                  </div>
                    <div className="level-right">
                    {this.state.playerReady &&
                    <div className="level-item" style={{height: 50}}>
                      <Slider
                        handleStyle={{borderColor: 'red'}}
                        trackStyle={{backgroundColor: 'red'}}
                        vertical
                        min={0}
                        max={1}
                        step={0.01}
                        value={this.state.volume}
                        onChange={this.handleVolume}
                      />
                    </div>
                    }
                    {this.state.isAdmin &&
                    <div className="level-item">
                      <div className="content has-text-centered">
                        <a className="button" onClick={() => this.handlePlay('toggle')}>{this.state.playing ? "Pause" : "Play"}</a>
                        <span style={{marginRight: 5}}/>
                        <a className="button" onClick={this.handleSongEnd}>Skip</a>
                      </div>
                    </div>
                    }
                  </div>
                </nav>
                }
                <ReactPlayer ref={this.ref} style={this.state.isAdmin ? {pointerEvents: 'auto'} : {pointerEvents: 'none'}} width="100%" url={this.state.url} config={{youtube:{preload: true}}} controls={this.state.isAdmin} playing={this.state.playing} volume={this.state.volume} onReady={() => this.setState({playerReady: true})} progressFrequency={500} onProgress={this.handleProgress} onPlay={() => this.handlePlay(true)} onPause={() => this.handlePlay(false)} onEnded={this.handleSongEnd} onError={this.handlePlayerError} />
              </div>
              <div className="column">
                <form onSubmit={this.handleSearch}>
                  <div className="field has-addons">
                    <div className="control is-expanded">
                      <input onChange={this.handleChange} className="input" type="text" placeholder="Search Youtube"/>
                    </div>
                    <div className="control">
                      <button type="submit" disabled={this.state.searchloading ? true : false} className={this.state.searchloading ? "button is-link is-loading" : "button is-link"} onClick={this.handleSearch}>Search</button>
                    </div>
                  </div>
                </form>
                <div className="content" style={{maxHeight: 400, overflowY: 'auto', marginTop: 5, overflowX: 'hidden'}}>
                  <table className="table is-narrow is-hoverable is-fullwidth">
                    <tbody>
                      {this.state.formattedResults}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div id="q" className="tab-content">
            <div className="columns">
              <div className="column">
                {!this.state.formattedQueue &&
                <div className="has-text-centered">
                  <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
                  <span className="sr-only">Loading...</span>
                </div>
                }
                {this.state.isAdmin && this.state.formattedQueue.length > 0 ?
                <nav className="level">
                  <div className="level-left">

                  </div>
                  <div className="level-right">
                    {this.state.queueConfirmAll &&
                      <div className="level-item">
                        <a className="button is-primary" onClick={() => this.handleDeleteAll('q')}>Confirm</a>
                      </div>
                    }
                    {this.state.queueConfirmAll &&
                      <div className="level-item">
                        <a className="button is-light" onClick={() => this.setState({queueConfirmAll: false})}>Cancel</a>
                      </div>
                    }
                    <div className="level-item">
                      <a className="button is-danger" disabled={this.state.queueConfirmAll ? true : false} onClick={() => this.setState({queueConfirmAll: true})}>Delete All</a>
                    </div>
                  </div>
                </nav>
                :
                null
                }
                {this.state.formattedQueue.length < 1 &&
                <div className="has-text-centered">No queue to display</div>
                }
                <table className="table is-narrow is-hoverable is-fullwidth">
                  <tbody>
                    {this.state.formattedQueue}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div id="h" className="tab-content">
            <div className="columns">
              <div className="column">
                {!this.state.formattedHistory &&
                <div className="has-text-centered">
                  <i className="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
                  <span className="sr-only">Loading...</span>
                </div>
                }
                {this.state.isAdmin && this.state.formattedHistory.length > 0 ?
                <nav className="level">
                  <div className="level-left">
                  </div>
                  <div className="level-right">
                    {this.state.historyConfirmAll &&
                      <div className="level-item">
                        <a className="button is-primary" onClick={() => this.handleDeleteAll('h')}>Confirm</a>
                      </div>
                    }
                    {this.state.historyConfirmAll &&
                      <div className="level-item">
                        <a className="button is-light" onClick={() => this.setState({historyConfirmAll: false})}>Cancel</a>
                      </div>
                    }
                    <div className="level-item">
                      <a className="button is-danger" disabled={this.state.historyConfirmAll ? true : false} onClick={() => this.setState({historyConfirmAll: true})}>Delete All</a>
                    </div>
                  </div>
                </nav>
                :
                null
                }
                {this.state.formattedHistory.length < 1 &&
                <div className="has-text-centered">No history to display</div>
                }
                <table className="table is-narrow is-hoverable is-fullwidth">
                  <tbody>
                    {this.state.formattedHistory}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className={this.state.deleteModal ? 'modal is-active' : 'modal'}>
          <div className="modal-background" onClick={() => this.setState({deleteModal: false})}></div>
          <div className="modal-content">
            <article className="message">
              <div className="message-header">
                <p>Confirm Room Deletion</p>
              </div>
              <div className="message-body">
                Are you sure you want to completely erase your room? You can always create a new one, but your queue and history will be lost.
                <nav className="level">
                  <div className="level-left"></div>
                  <div className="level-right">
                    <div className="level-item">
                      <button className="button is-danger" style={{marginRight: 15}} onClick={this.handleRoomDelete}>Confirm</button>
                      <button className="button is-light" onClick={() => this.setState({deleteModal: false})}>Cancel</button>
                    </div>
                  </div>
                </nav>
              </div>
            </article>
          </div>
          <button className="modal-close is-large" aria-label="close"></button>
        </div>
        <div className={this.state.publicModal ? 'modal is-active' : 'modal'}>
          <div className="modal-background" onClick={() => this.setState({publicModal: false})}></div>
          <div className="modal-content">
            <article className="message">
              <div className="message-header">
                <p>Set Room Visibility</p>
              </div>
              <div className="message-body">
                {this.state.isPublic === false ?
                <p>Going public will allow anyone to join your room and add to your playlist. Would you like to go public?</p>
                :
                <p>Going private will remove you from the public room list. Would you like to go private?</p>
                }
                <nav className="level">
                  <div className="level-left"></div>
                  <div className="level-right">
                    <div className="level-item">
                      <button className="button is-danger" style={{marginRight: 15}} onClick={this.handlePublic}>Confirm</button>
                      <button className="button is-light" onClick={() => this.setState({publicModal: false})}>Cancel</button>
                    </div>
                  </div>
                </nav>
              </div>
            </article>
          </div>
          <button className="modal-close is-large" aria-label="close"></button>
        </div>
      </section>
    );
  }
}

export default Room;
