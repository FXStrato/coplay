import React, { Component } from 'react';
import { Row, Col, Form, Input, Tooltip, Icon, InputNumber, Button, Checkbox, message, Popconfirm, Spin } from 'antd';
import firebase from 'firebase';
const FormItem = Form.Item;
const { TextArea } = Input;
const db = firebase.firestore();

class RoomSettings extends Component {

  state = {
    loading: false,
    room: null,
    fbid: null
  }

  componentWillMount = () => {
    db.collection('rooms').where('name', '==', this.props.roomID).get().then(snap => {
      if(snap.docs.length === 1) {
        this.setState({ room: snap.docs[0].data(), fbid: snap.docs[0].id });
      } else {
        message.error('Unable to load room settings');
      }
    }).catch(err => {
      message.error(err.message);
      console.log(err);
    })
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        let newData = Object.assign(this.state.room, values);
        db.collection('rooms').doc(this.state.fbid).update(newData).then(() => {
          if(!values.isPublic) {
            db.collection("public").doc(this.state.fbid).delete().then(() => {
              message.success('Successfully saved settings');
              this.setState({ loading: false });
            }).catch(err => {
              this.setState({loading: false});
              message.error(err.message);
              console.log(err);
            })
          } else {
            db.collection("public").doc(this.state.fbid).set(newData).then(() => {
              message.success('Successfully saved settings');
              this.setState({ loading: false });
            }).catch(err => {
              this.setState({loading: false});
              message.error(err.message);
              console.log(err);
            })
          }
        }).catch(err => {
          this.setState({loading: false});
          message.error(err.message);
          console.log(err);
        })
      }
    });
  }

  //Deletes room, if room was public, remove it from public list as well
  handleDelete = () => {
    if(this.state.room) {
      db.collection("rooms").doc(this.state.fbid).delete();
      if(this.state.room.isPublic) {
        db.collection("public").doc(this.state.fbid).delete();
      }
    }
  }

  handleCheckbox = (e, param) => {
    let temp = this.state.room;
    temp[param] = e.target.checked;
    this.setState({room: temp});
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
      <Spin spinning={this.state.loading} style={{width: '100%'}} className="center">
        {this.state.room &&
        <Row>
          <Col span={24}>
            <Popconfirm
              title="Confirm Delete"
              onConfirm={this.handleDelete}
            >
              <Button className="right">Delete Room</Button>
            </Popconfirm>
          </Col>
          <Col sm={24} md={24} lg={24} xl={11}>
            <h3>Room Settings</h3>
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
              <FormItem {...formItemLayout} label="Room Name">
                <p>{this.state.room.name}'s Room</p>
              </FormItem>
              <FormItem {...formItemLayout} label="Room Description">
                 {getFieldDecorator('description', {initialValue: this.state.room.description})(
                   <TextArea rows={3}/>
                 )}
               </FormItem>
               <FormItem {...formItemLayout} label={(
                 <span>
                   Is Public&nbsp;
                   <Tooltip title="Private rooms will not show up on the public room list">
                     <Icon type="question-circle-o" />
                   </Tooltip>
                 </span>
               )}>
                  {getFieldDecorator('isPublic', { valuePropName: 'isPublic', initialValue: this.state.room.isPublic })(
                    <Checkbox checked={this.state.room.isPublic} onChange={e => this.handleCheckbox(e, 'isPublic')}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label={(
                  <span>
                    Open Queue&nbsp;
                    <Tooltip title="Checking this box will allow room visitors that are not signed in to queue up items">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}>
                   {getFieldDecorator('isOpen', { valuePropName: 'isOpen', initialValue: this.state.room.isOpen })(
                     <Checkbox checked={this.state.room.isOpen} onChange={(e) => this.handleCheckbox(e, 'isOpen')}/>
                   )}
                 </FormItem>
                 <FormItem {...formItemLayout} label={<span>
                   Capacity&nbsp;
                   <Tooltip title="Number of allowable visitors to room; select from 0-100, 50 is default.">
                     <Icon type="question-circle-o" />
                   </Tooltip>
                 </span>}>
                    {getFieldDecorator('capacity', {
                      initialValue: this.state.room.capacity,
                    })(
                      <InputNumber min={0} max={100} />
                    )}
                  </FormItem>
                 <FormItem style={{marginBottom: 5}}>
                   <Button loading={this.state.loading} type="primary" htmlType="submit">Save Changes</Button>
                 </FormItem>
             </Form>
          </Col>
        </Row>
        }
      </Spin>
    );
  }
}

export default Form.create()(RoomSettings);
