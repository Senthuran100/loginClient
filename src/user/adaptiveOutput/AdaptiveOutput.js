import React, { Component } from 'react';
import { Form, Input, Button, Select, notification } from 'antd';
import { SECURITY_ANS_MIN_LENGTH, SECURITY_ANS_MAX_LENGTH, OTP_CODE_LENGTH, USERNAME, AUTHFACTOR } from '../../constants';
import './AdaptiveOutput.css';
import { secondLogin, generateOTPCode } from '../../util/APIUtils';

const FormItem = Form.Item;
const { Option } = Select;

class AdaptiveOutput extends Component {
    constructor(props) {
        super(props);
        this.state = {
            question: {
                value: ''
            },
            answer: {
                value: ''
            },
            authfactor: '',
            code: {
                value: '',
            }
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
        this.handleSecurityQuestion = this.handleSecurityQuestion.bind(this);
    }

    componentDidMount() {
        const username = this.props.username;
        // console.log('username', username);
        this.setState({ authfactor: localStorage.getItem(AUTHFACTOR) });
        if (localStorage.getItem(AUTHFACTOR) === 'OTP') {
            generateOTPCode({ username: localStorage.getItem(USERNAME) })
                .then(response => {
                    if (response.message === 'Success') {
                        notification.success({
                            message: 'Adaptive Auth',
                            description: 'OTP code is sent to your email ID'
                        });
                    } else {
                        notification.error({
                            message: 'Adaptive Auth',
                            description: 'Failure in sending OTP.Please try contact your admin'
                        });
                    }
                })
        }
    }

    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        this.setState({
            [inputName]: {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();

        const adaptiveRequest = {
            username: localStorage.getItem('username'),
            question: this.state.question.value,
            answer: this.state.answer.value,
            authFactor: localStorage.getItem('authfactor'),
            code: this.state.code.value
        };

        secondLogin(adaptiveRequest)
            .then(response => {
                // console.log('respp', response);

                if (response.message === 'Verified') {
                    this.props.onLogin();
                } else {
                    notification.error({
                        message: 'Adaptive Auth',
                        description: "Entered Data is InValid.Please Try Again.",
                    });
                }
            }).catch(error => {
                notification.error({
                    message: 'Adaptive Auth',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });

        // console.log('adaptiveRequest', adaptiveRequest);
    }

    validateAnswer = (amswer) => {
        if (amswer.length < SECURITY_ANS_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Answer is too short (Minimum ${SECURITY_ANS_MIN_LENGTH} characters needed.)`
            }
        } else if (amswer.length > SECURITY_ANS_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Answer is too long (Maximum ${SECURITY_ANS_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }

    validateOTPCode = (code) => {
        if (code.length < OTP_CODE_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `OTP Code is too short (Minimum ${OTP_CODE_LENGTH} characters needed.)`
            }
        } else if (code.length > OTP_CODE_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `OTP Code is too long (Maximum ${OTP_CODE_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }

    handleSecurityQuestion = (event) => {
        // console.log('ec', event);
        this.setState({ question: { value: event } })
    }

    isFormInvalid() {
        return !(this.state.answer.validateStatus === 'success' || this.state.code.validateStatus === 'success');
    }

    render() {
        return (
            <div className="signup-container">
                <Form onSubmit={this.handleSubmit} className="login-form" onMouseDown={this.handleEvent} onMouseUp={this.handleEvent} >
                    {this.state.authfactor === 'security_question' ? (
                        <div>
                            <FormItem
                                label="Security Question" required>
                                <Select
                                    size="large"
                                    name="Securityquestion"
                                    value={this.state.question.value}
                                    onChange={(event) => this.handleSecurityQuestion(event)} >
                                    <Option value="question1">What is your favourite colour?</Option>
                                    <Option value="question2">What is your mother's maiden name?</Option>
                                    <Option value="question3">What is the name of your first pet?</Option>
                                    <Option value="question4">What is the name of the town where you were born?</Option>
                                    <Option value="question5">What is your favourite movie?</Option>
                                </Select>
                            </FormItem>
                            <FormItem label="Security Answer"
                                hasFeedback
                                validateStatus={this.state.answer.validateStatus}
                                help={this.state.answer.errorMsg}
                            >
                                <Input
                                    size="large"
                                    name="answer"
                                    autoComplete="off"
                                    placeholder="Your Security Answer"
                                    value={this.state.answer.value}
                                    onChange={(event) => this.handleInputChange(event, this.validateAnswer)} />
                            </FormItem>
                        </div>
                    ) : <FormItem label="OTP Code"
                        hasFeedback
                        validateStatus={this.state.code.validateStatus}
                        help={this.state.code.errorMsg}
                    >
                        <Input
                            size="large"
                            name="code"
                            autoComplete="off"
                            placeholder="Please enter the 6 digit OTP Code"
                            value={this.state.code.value}
                            onChange={(event) => this.handleInputChange(event, this.validateOTPCode)} />
                    </FormItem>}
                    <FormItem>
                        <Button type="primary"
                            htmlType="submit"
                            size="large"
                            className="signup-form-button"
                            disabled={this.isFormInvalid()}
                        >Submit</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }
}

export default AdaptiveOutput;