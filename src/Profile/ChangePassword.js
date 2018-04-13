import React, { Component } from 'react';
import { Row, Col, Form, Input, Button, Alert } from 'antd';
import firebase from 'firebase';
const FormItem = Form.Item;

class ChangePassword extends Component {

  state = {
    confirmDirty: false,
    loading: false,
    error: null,
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if(!err) {
        if(values.oldpassword === values.newpassword) this.setState({error: {code: 409, message: "Same password detected, please use a new password"}});
        else {
          this.setState({loading: true, error: null});
          const user = firebase.auth().currentUser;
          if(user) {
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, values.oldpassword);
            user.reauthenticateWithCredential(credential).then(() => {
              user.updatePassword(values.newpassword).then(() => {
                this.setState({loading: false});
                this.props.callback();
              }).catch((error) => {
                this.setState({loading: false, error});
              });
            }).catch((error) => {
              this.setState({loading: false, error});
            });
          }
        }
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
    if (value && value !== form.getFieldValue('newpassword')) {
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
            <Alert style={{marginBottom: 10}} message={this.state.error.code} description={this.state.error.message} closable={true} type="error"/>
            }
            <Form onSubmit={this.handleSubmit} hideRequiredMark={true}>
              <FormItem
                {...formItemLayout}
                label="Old Password"
              >
                {getFieldDecorator('oldpassword', {
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
                label="New Password"
              >
                {getFieldDecorator('newpassword', {
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
                label="Confirm New Password"
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
              <FormItem style={{marginBottom: 5}}>
                <Button loading={this.state.loading} type="primary" htmlType="submit" style={{width: '100%'}}>Save Password</Button>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(ChangePassword);
