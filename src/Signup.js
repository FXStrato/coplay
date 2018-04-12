import React, { Component } from 'react';
import firebase from 'firebase';
import { Row, Col, Form, Button, Icon, Tooltip, Input, Alert } from 'antd';
const FormItem = Form.Item;
const db = firebase.firestore();

class Signup extends Component {

  state = {
    loading: false,
    error: null,
    confirmDirty: false,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        this.setState({loading: true, error: null});
        //Handling signin and addition to user collection
        firebase.auth().createUserWithEmailAndPassword(values.email, values.password).then(user => {
          let temp = {};
          temp.uid = user.uid;
          temp.email = user.email;
          temp.displayName = values.nickname;
          temp.storageURL = "";
          temp.createdAt = firebase.firestore.FieldValue.serverTimestamp();
          //TODO: Add to user collection
          user.updateProfile({
            displayName: values.nickname,
            photoURL: ""
          }).then(() => {
            db.collection('users').doc(user.uid).set(temp).then(() => {
              db.collection('nicknames').doc(values.nickname).set({uid: user.uid, timestamp: firebase.firestore.FieldValue.serverTimestamp()}).then(() => {
                this.setState({loading: false});
                window.location.reload();
              });
            });
          })

        }).catch((error) => {
          // Handle Errors here.
          let temp = {
            code: error.code,
            message: error.message,
          }
          this.setState({error: temp, loading: false});
          // ...
        });
      } else {
        let clear = true;
        for(let key in values) {
          if(values[key] !== undefined && values[key] !== "") clear = false;
        }
        if(clear) this.props.form.resetFields();
      }
    });
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Passwords do not match');
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  validateNickname = (rule, value, callback) => {
    //const form = this.props.form;
    if(value) {
      db.collection('nicknames').doc(value.trim()).get().then(doc => {
        if(doc.exists) {
          //form.setFields({nickname: {value}});
          callback('Nickname already exists');
        } else {
          callback();
        }
      })
    } else callback();
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
        <Row>
          <Col span={24}>
            {this.state.error &&
            <Alert message={this.state.error.code} description={this.state.error.message} closable={true} type="error"/>
            }
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
             <FormItem
               {...formItemLayout}
               label="E-mail"
             >
               {getFieldDecorator('email', {
                 rules: [{
                   type: 'email', message: 'The input is not valid E-mail!',
                 }, {
                   required: true, message: 'Please input your E-mail!',
                 }],
               })(
                 <Input />
               )}
             </FormItem>
             <FormItem
               {...formItemLayout}
               label="Password"
             >
               {getFieldDecorator('password', {
                 rules: [{
                   required: true, message: 'Password must be a minimum of 6 characters', min: 6,
                 }, {
                   validator: this.validateToNextPassword,
                 }],
               })(
                 <Input type="password" />
               )}
             </FormItem>
             <FormItem
               {...formItemLayout}
               label="Confirm Password"
             >
               {getFieldDecorator('confirm', {
                 rules: [{
                   required: true, message: 'Please confirm your password!',
                 }, {
                   validator: this.compareToFirstPassword,
                 }],
               })(
                 <Input type="password" onBlur={this.handleConfirmBlur} />
               )}
             </FormItem>
             <FormItem
               {...formItemLayout}
               label={(
                 <span>
                   Display Name&nbsp;
                   <Tooltip title="3-20 char length; numbers, letters and underscore are allowed, no spaces">
                     <Icon type="question-circle-o" />
                   </Tooltip>
                 </span>
               )}
             >
               {getFieldDecorator('nickname', {
                 validateTrigger: false,
                 rules: [{ required: true, message: 'Invalid format, please check tooltip', pattern: /^[A-Za-z0-9_]+$/, whitespace: false, min: 3, max: 20}, {
                   validator: this.validateNickname,
                 }],
               })(
                 <Input />
               )}
             </FormItem>
             <FormItem style={{marginBottom: 5}}>
               <Button loading={this.state.loading} style={{width: '100%'}} type="primary" htmlType="submit">Register</Button>
             </FormItem>
           </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(Signup);
