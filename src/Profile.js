import React, { Component } from 'react';
import { Row, Col, Tabs, Icon, Spin, Form, Upload, Button, Modal, message } from 'antd';
import firebase from 'firebase';
import Loadable from 'react-loadable';
import Loading from './Loading';
import Img from 'react-image';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const db = firebase.firestore();
const storage = firebase.storage();
const ChangePassword = Loadable({
  loader: () =>
    import('./Profile/ChangePassword'),
  loading: Loading
});

class Profile extends Component {

  state = {
    initialLoad: false,
    loading: false,
    formloading: false,
    preview: false,
    previewImage: '',
    change: false,
    user: null,
    dbUser: null,
    pic: null,
  }

  componentWillMount = () => {
    this.setState({ loading: true });
    this.authRef = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User is signed in.
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            let pic;
            if (doc.data().pictureURL && doc.data().storageURL) {
              pic = [{
                uid: -1,
                name: 'profile.pic',
                status: 'done',
                url: doc.data().storageURL,
                thumbUrl: doc.data().storageURL
              }]
            }
            this.setState({pic, user, dbUser: doc.data(), loading: false, initialLoad: true});
          }
        })
      } else {
        // User is signed out.
        this.setState({ loading: false, initialLoad: true });
      }
    });
  }

  componentWillUnmount = () => {
    this.authRef();
  }

  handleCallback = () => {
    //Callback from changepassword component, close the modal if it is open, display success
    this.setState({change: false});
    message.success('Successfully changed password');
  }

  //Handle profile change submission
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({ formloading: true });
    //Check first to see if removing or uploading pic
    if(this.state.pic) {
      let type = this.state.pic[0].name.split('.');
      type = type[type.length - 1];
      if (this.state.dbUser.pictureURL) {
        //If picture already exists, remove old one and upload new
        storage.ref().child(this.state.dbUser.pictureURL).delete().then(() => {
          storage.ref().child(this.state.user.uid + '/profilepic.' + type).put(this.state.pic[0]).then(res => {
            let temp = this.state.dbUser;
            temp.storageURL = res.downloadURL;
            temp.pictureURL = this.state.user.uid + '/profilepic.' + type;
            db.collection('users').doc(this.state.user.uid).update(temp).then(() => {
              this.state.user.updateProfile({
                photoURL: res.downloadURL
              }).then(() => {
                message.success('Successfully updated profile');
                this.props.callback();
                this.setState({ formloading: false });
              })
            });
          }).catch(err => {
            message.error('Error occured uploading new image');
            console.log(err);
            this.setState({ formloading: false });
          })
        }).catch(err => {
          if(err.code.includes('object-not-found')) {
            let temp = this.state.dbUser;
            temp.storageURL = "";
            temp.pictureURL = "";
            db.collection('users').doc(this.state.user.uid).update(temp).then(() => {
              this.state.user.updateProfile({
                photoURL: ""
              }).then(() => {
                message.success('Successfully updated profile');
                this.props.callback();
                this.setState({ formloading: false });
              })
            });
          } else {
            message.error('Error occured removing old picture from storage');
            console.log(err);
            this.setState({ formloading: false });
          }
        })
      } else {
        //if picture didnt' already exist, just upload new one
        storage.ref().child(this.state.user.uid + '/profilepic.' + type).put(this.state.pic[0]).then(res => {
          let temp = this.state.dbUser;
          temp.storageURL = res.downloadURL;
          temp.pictureURL = this.state.user.uid + '/profilepic.' + type;
          db.collection('users').doc(this.state.user.uid).update(temp).then(() => {
            this.state.user.updateProfile({
              photoURL: res.downloadURL
            }).then(() => {
              message.success('Successfully updated profile');
              this.props.callback();
              this.setState({ formloading: false });
            })
          });
        }).catch(err => {
          message.error('Error occured uploading new image');
          console.log(err);
          this.setState({ formloading: false });
        })
      }
    } else {
      //removing old profile picture
      if(this.state.dbUser.pictureURL) {
        //Situation of removing picture when there was one
        storage.ref().child(this.state.dbUser.pictureURL).delete().then(() => {
          let temp = this.state.dbUser;
          temp.storageURL = "";
          temp.pictureURL = "";
          db.collection('users').doc(this.state.user.uid).update(temp).then(() => {
            this.state.user.updateProfile({
              photoURL: ""
            }).then(() => {
              message.success('Successfully updated profile');
              this.props.callback();
              this.setState({ formloading: false });
            })
          });
        }).catch(err => {
          if(err.code.includes('object-not-found')) {
            let temp = this.state.dbUser;
            temp.storageURL = "";
            temp.pictureURL = "";
            db.collection('users').doc(this.state.user.uid).update(temp).then(() => {
              this.state.user.updateProfile({
                photoURL: ""
              }).then(() => {
                message.success('Successfully updated profile');
                this.props.callback();
                this.setState({ formloading: false });
              })
            });
          } else {
            message.error('Error occured removing old picture from storage');
            console.log(err);
            this.setState({ formloading: false });
          }
        })
      } else {
        //No picture to add, no picture to delete
        this.setState({ formloading: false });
      }
    }
  }

  // Handles previewing of profile pic
  handlePreview = file => {
    this.setState({ preview: true, previewImage: file.url || file.thumbUrl })
  }

  //Modifies status of uploaded file to prevent red outline
  handleChange = ({ fileList }) => {
    console.log(fileList);
    if (fileList.length > 0) {
      fileList[0].status = "done";
      this.setState({ pic: fileList })
    } else {
      this.setState({ pic: null })
    }
  }

  render() {
    //const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Spin className="center" spinning={this.state.loading} style={{width: '100%'}}>
        {this.state.initialLoad &&
        <Row>
          {!this.state.user ?
          <Col span={24}>
            <h3>Login to view profile</h3>
          </Col>
          :
          <Col span={24}>
            <Tabs defaultActiveKey="1">
              <TabPane tab={<span><Icon type="user" />General</span>} key="1">
                <Row>
                  <Col xs={24} sm={24} md={18} lg={12} xl={6}>
                    <Form onSubmit={this.handleSubmit}>
                      <FormItem {...formItemLayout} label="Display Name" style={{marginBottom: 5}}>
                        <div>{this.state.user.displayName}</div>
                      </FormItem>
                      <FormItem {...formItemLayout} label="Email">
                        <div>{this.state.user.email}</div>
                      </FormItem>
                      <FormItem {...formItemLayout} label="Profile Picture" extra="Use equal dimensions for best results">
                        <Upload name="profilepic" fileList={this.state.pic} accept="image/*" listType="picture-card"
                        action=""
                        onPreview={this.handlePreview}
                        onChange={this.handleChange}
                        beforeUpload={file => {return false}}
                        >
                          {!this.state.pic &&
                          <div>
                            <Icon type="upload" /> <br/> Click to upload
                          </div>
                          }
                        </Upload>
                      </FormItem>
                      <FormItem label="Account" {...formItemLayout}>
                        <Button onClick={() => this.setState({change: true})}>Change Password</Button>
                      </FormItem>
                      <FormItem style={{marginBottom: 5}}>
                        <Button loading={this.state.formloading} type="primary" htmlType="submit" style={{width: '100%'}}>Save Changes</Button>
                      </FormItem>
                    </Form>
                    <Modal visible={this.state.preview} footer={null} onCancel={() => this.setState({preview: false})}>
                      <Img alt="profile-preview" style={{ width: '100%' }} src={this.state.previewImage} />
                    </Modal>
                    <Modal title="Changing Password" visible={this.state.change} footer={null} onCancel={() => this.setState({change: false})}>
                      <ChangePassword callback={this.handleCallback}/>
                    </Modal>
                  </Col>
                </Row>
              </TabPane>
              <TabPane tab={<span><Icon type="laptop" />Room Settings</span>} key="2">
                <Row>
                  <Col xs={24} sm={24} md={18} lg={12} xl={6}>
                    Tab 2, Room settings
                  </Col>
                </Row>
              </TabPane>
            </Tabs>
          </Col>
          }
        </Row>
        }
      </Spin>
    );
  }
}

export default Form.create()(Profile);
