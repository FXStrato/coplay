import React, { Component } from 'react';
import { Row, Col, Form, Input, Tooltip, Icon, InputNumber, Button, Checkbox, message } from 'antd';
import firebase from 'firebase';
const FormItem = Form.Item;
const { TextArea } = Input;
const db = firebase.firestore();

class RoomSettings extends Component {

  state = {
    loading: false,
    room: null
  }

  componentWillMount = () => {
    db.collection('rooms').doc(this.props.roomID).get().then(doc => {
      this.setState({ room: doc.data() });
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({ loading: true });
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        db.collection('rooms').doc(this.props.user.displayName).update(this.state.room).then(() => {
          message.success('Successfully saved settings');
          this.setState({ loading: false });
        }).catch(err => {
          this.setState({loading: false});
          message.error(err.message);
          console.log(err);
        })

      }
    });
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
      <div>
        {this.state.room &&
        <Row className="animated fadeIn">
          <Col sm={24} md={24} lg={24} xl={11}>
            <h3>Room Settings</h3>
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
              <FormItem {...formItemLayout} label="Room Description">
                 {getFieldDecorator('description', {initialValue: this.state.room.description})(
                   <TextArea rows={3}/>
                 )}
               </FormItem>
               <FormItem {...formItemLayout} label={(
                 <span>
                   Make Public&nbsp;
                   <Tooltip title="Rooms are private by default; private rooms will not show up on the public room list.">
                     <Icon type="question-circle-o" />
                   </Tooltip>
                 </span>
               )}>
                  {getFieldDecorator('visibility', { valuePropName: 'visiblity', initialValue: this.state.room.visibility })(
                    <Checkbox checked={this.state.room.visibility} onChange={e => this.handleCheckbox(e, 'visibility')}/>
                  )}
                </FormItem>
                <FormItem {...formItemLayout} label={(
                  <span>
                    Open Queueing&nbsp;
                    <Tooltip title="Checking this box will allow room visitors not signed in to queue up items">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}>
                   {getFieldDecorator('open_queue', { valuePropName: 'open_queue', initialValue: this.state.room.open_queue })(
                     <Checkbox checked={this.state.room.open_queue} onChange={(e) => this.handleCheckbox(e, 'open_queue')}/>
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
      </div>
    );
  }
}

export default Form.create()(RoomSettings);
