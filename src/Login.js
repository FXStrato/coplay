import React, { Component } from 'react';
import { Row, Col, Form, Icon, Input, Button } from 'antd';
import firebase from 'firebase';
const FormItem = Form.Item;


class Login extends Component {

  state = {
    loading: false,
    error: null,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({error: null, loading: true});
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        firebase.auth().signInWithEmailAndPassword(values.email, values.password).catch((error) => {
          // Handle Errors here.
          this.setState({error, loading: false});
        });
      }
    });
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Row>
          <Col span={24}>
            <Form onSubmit={this.handleSubmit}>
              <FormItem>
                {getFieldDecorator('email', {
                  rules: [{ required: true, message: 'Please input your username!' }],
                })(
                  <Input type="email" prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Email" />
                )}
              </FormItem>
              <FormItem style={{marginBottom: 5}}>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: 'Please input your Password!' }],
                })(
                  <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                )}
              </FormItem>
              <FormItem style={{marginBottom: 5}}>
                <Button loading={this.state.loading} type="primary" htmlType="submit" style={{width: '100%'}}>Log in</Button>
              </FormItem>
            </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(Login);
