import React, { Component } from 'react';
import { Row, Col, Form, Button, Icon, Tooltip, Input } from 'antd';
const FormItem = Form.Item;

class Signup extends Component {

  state = {
    confirmDirty: false,
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
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
      callback('Two passwords that you enter is inconsistent!');
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
    const form = this.props.form;
    setTimeout(() => {
      form.setFields({nickname: {value, errors: [new Error('Test error')]}});
      callback();
    }, 1000);
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
            <Form onSubmit={this.handleSubmit}>
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
                   required: true, message: 'Please input your password!',
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
                   <Tooltip title="3-20 character length; numbers, letters and underscore are allowed">
                     <Icon type="question-circle-o" />
                   </Tooltip>
                 </span>
               )}
             >
               {getFieldDecorator('nickname', {
                 validateTrigger: 'onBlur',
                 rules: [{ required: true, message: 'Please input a valid nickname', whitespace: true, min: 3, max: 20}, {
                   validator: this.validateNickname,
                 }],
               })(
                 <Input />
               )}
             </FormItem>
             <FormItem>
               <Button style={{width: '100%'}} type="primary" htmlType="submit">Register</Button>
             </FormItem>
           </Form>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Form.create()(Signup);
