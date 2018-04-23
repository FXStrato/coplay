import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Icon, Card, Button, message, Modal, Form, Input, Tooltip, Checkbox, InputNumber, Spin, Tag } from 'antd';
import firebase from 'firebase';
import Img from 'react-image';
const db = firebase.firestore();
const FormItem = Form.Item;
const { TextArea } = Input;
const { Meta } = Card;

class Home extends Component {

  state = {
    initialLoad: false,
    loading: false,
    user: null,
    roomMade: false,
    visible: false,
    room: null,
    queueSize: null,
    historySize: null,
    np: null,
    qLoad: false,
    hLoad: false,
    npLoad: false,
  }

  componentWillMount = () => {
    this.authRef = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        this.setState({ user });
        //Check if they have a room created
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            if (doc.data().roomMade) {
              db.collection('rooms').doc(user.uid).get().then(doc => {
                if (doc.exists) {
                  db.collection('rooms').doc(user.uid).collection('np').doc('np').get().then(doc => {
                    if (doc.exists) this.setState({ np: doc.data(), npLoad: true })
                    else this.setState({npLoad: true});
                  }).catch(err => {
                    console.log(err);
                    this.setState({npLoad: true});
                  })
                  db.collection('rooms').doc(user.uid).collection('queue').get().then(snap => {
                    this.setState({ queueSize: snap.size,  qLoad: true});
                  }).catch(err => {
                    console.log(err);
                    this.setState({qLoad: true});
                  })
                  db.collection('rooms').doc(user.uid).collection('history').get().then(snap => {
                    this.setState({ historySize: snap.size, hLoad: true });
                  }).catch(err => {
                    console.log(err);
                    this.setState({hLoad: true});
                  })
                  this.setState({ roomMade: true, initialLoad: true, room: doc.data() });
                }
              }).catch(err => {
                console.log(err);
                message.error(err.message);
              })
            } else this.setState({ initialLoad: true });
          } else {
            message.error('Document for user does not exist');
          }
        })
      } else {
        // User is signed out.
        this.setState({ initialLoad: true });
      }
    });
  }

  componentWillUnmount = () => {
    this.authRef();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let temp = values;
        temp.name = this.state.user.displayName;
        temp.owner = this.state.user.uid;
        temp.ownerPic = this.state.user.photoURL || null;
        temp.timestamp = firebase.firestore.FieldValue.serverTimestamp();
        db.collection('rooms').doc(this.state.user.uid).set(temp).then(() => {
          if (values.isPublic) this.handlePublic(temp);
          db.collection('users').doc(this.state.user.uid).update({ roomMade: true }).then(() => {
            this.props.history.push('/room/' + this.state.user.displayName);
          })
        }).catch(err => {
          this.setState({ loading: false });
          message.error(err.message);
          console.log(err);
        })
        console.log(temp);
      }
    });
  }

  //Call this function if public was selected, will place room into public list
  handlePublic = (temp) => {
    db.collection("public").doc(this.state.user.uid).set(temp).then(() => {
      return true;
    }).catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
    };
    return (
      <Spin spinning={!this.state.initialLoad} style={{width: '100%'}} className="center">
        {this.state.initialLoad &&
        <Row className="animated fadeIn" gutter={16} type="flex" justify="center">
          {this.state.roomMade && this.state.room ?
          <Col sm={24} md={24} lg={24} xl={11}>
            <Card style={{width: "100%"}} title={<span style={{verticalAlign: 'middle'}}>{this.state.room.name}'s Room</span>} extra={<Link to={`/room/${this.state.room.name}`}><Button>Enter Room</Button></Link>}>
              <Row>
                <Col xs={24}>
                  <div className="right-align">
                    {this.state.room.isPublic ? <Tag>Public</Tag> : <Tag>Private</Tag>}
                    {this.state.room.isOpen && <Tag>Open Queue</Tag>}
                    <span>{this.state.room.participantCount}/{this.state.room.capacity} <Icon type="user"/></span>
                  </div>
                </Col>
              </Row>
              <Row style={{marginTop: 15}} gutter={16}>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <div className="center">
                    <Card title="Now Playing" loading={!this.state.npLoad} style={{width: '100%'}} cover={this.state.np && this.state.np.thumbnails ? <Img src={this.state.np.thumbnails.medium.url} style={{maxHeight: 200}} className="responsive-img"/> : null}>
                    {this.state.np && this.state.np.title ?
                    <div>
                      <Meta
                        title={this.state.np.title}
                        description={<span className="truncate">{this.state.np.description}</span>}
                      />
                      {!this.state.np.playing ? <Icon style={{marginTop: 10, marginBottom: -10}} type="pause"/> : <Icon style={{marginTop: 10, marginBottom: -10}} type="sound"/>}
                    </div>
                    :
                    <h4>Empty</h4>}
                    </Card>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <div className="center">
                    <Card title="Queue Size" loading={!this.state.qLoad} style={{width: '100%'}}>
                      <h4>{this.state.queueSize}</h4>
                    </Card>
                  </div>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                  <div className="center">
                    <Card title={'History Size'} loading={!this.state.hLoad} style={{width: '100%'}}>
                      <h4>{this.state.historySize}</h4>
                    </Card>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
          :
          <Col sm={24} md={24} lg={24} xl={11}>
            {this.state.user ?
            <Card style={{width: "100%"}} title={<span style={{paddingTop: 10, verticalAlign: 'middle'}}>Your Room</span>}
            extra={<Button onClick={() => this.setState({visible: true})}>Create Room</Button>}>
              <p>You don't have your own room yet; click on Create Room to make one</p>
            </Card>
            :
            <Card style={{width: "100%"}} title={<span style={{paddingTop: 10, verticalAlign: 'middle'}}>Your Room</span>}
            extra={<Button type="primary" onClick={this.props.callback}>Sign Up Now</Button>}>
              <p>Create an account to host your own room</p>
              <ul>
                <li>Query Youtube and watch or listen together</li>
                <li>Save playlists of videos for later viewing</li>
                <li>Choose to share your room or keep it private to your own party</li>
              </ul>
            </Card>
            }
          </Col>
          }
        </Row>
        }
        <Modal
          title={"Creating Room"}
          wrapClassName="vertical-center-modal"
          visible={this.state.visible}
          footer={null}
          onOk={() => this.setState({visible: false})}
          onCancel={() => this.setState({visible: false})}
        >
          <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
            <FormItem {...formItemLayout} label="Room Description">
               {getFieldDecorator('description', {
                 rules: [{}, {}],
               })(
                 <TextArea rows={3}/>
               )}
             </FormItem>
             <FormItem {...formItemLayout} label={(
               <span>
                 Is Public&nbsp;
                 <Tooltip title="Public rooms will show up on the public room list; private will not">
                   <Icon type="question-circle-o" />
                 </Tooltip>
               </span>
             )}>
                {getFieldDecorator('isPublic', { valuePropName: 'isPublic', initialValue: false })(
                  <Checkbox/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={(
                <span>
                  Open Queue&nbsp;
                  <Tooltip title="Checking this box will allow room visitors not signed in to queue up items">
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </span>
              )}>
                 {getFieldDecorator('isOpen', { valuePropName: 'isOpen', initialValue: false })(
                   <Checkbox/>
                 )}
               </FormItem>
               <FormItem {...formItemLayout} label={<span>
                 Capacity&nbsp;
                 <Tooltip title="Number of allowable visitors to room; select from 0-100, 50 is default.">
                   <Icon type="question-circle-o" />
                 </Tooltip>
               </span>}>
                  {getFieldDecorator('capacity', {
                    initialValue: 50,
                  })(
                    <InputNumber min={0} max={100} />
                  )}
                </FormItem>
               <FormItem style={{marginBottom: 5}}>
                 <Button loading={this.state.loading} style={{width: '100%'}} type="primary" htmlType="submit">Create Room</Button>
               </FormItem>
           </Form>
        </Modal>
      </Spin>
    );
  }
}

export default Form.create()(Home);
