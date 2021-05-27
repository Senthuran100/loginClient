import React, { Component } from 'react';
import { signup, checkUsernameAvailability, checkEmailAvailability } from '../../util/APIUtils';
import './Signup.css';
import { Link } from 'react-router-dom';
import {
    NAME_MIN_LENGTH, NAME_MAX_LENGTH,
    USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH,
    EMAIL_MAX_LENGTH,
    PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH,
    SECURITY_ANS_MAX_LENGTH, SECURITY_ANS_MIN_LENGTH
} from '../../constants';
import 'antd/dist/antd.css';
import { Form, Input, Button, notification, Select } from 'antd';
import mainLogo from '../../Logo.png';

const FormItem = Form.Item;
const { Option } = Select;

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: {
                value: ''
            },
            username: {
                value: ''
            },
            email: {
                value: ''
            },
            password: {
                value: ''
            },
            question: {
                value: ''
            },
            answer: {
                value: ''
            }
        }
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateUsernameAvailability = this.validateUsernameAvailability.bind(this);
        this.validateEmailAvailability = this.validateEmailAvailability.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
        this.handleSecurityQuestion = this.handleSecurityQuestion.bind(this);
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

    handleSecurityQuestion = (event) => {
        // console.log('ec', event);
        this.setState({ question: { value: event } })
    }

    handleSubmit(event) {
        event.preventDefault();

        const signupRequest = {
            name: this.state.name.value,
            email: this.state.email.value,
            username: this.state.username.value,
            password: this.state.password.value,
            question: this.state.question.value,
            answer: this.state.answer.value
        };

        signup(signupRequest)
            .then(response => {
                notification.success({
                    message: 'Adaptive Auth',
                    description: "Thank you! You're successfully registered. Please Login to continue!",
                });
                this.props.history.push("/login");
            }).catch(error => {
                notification.error({
                    message: 'Adaptive Auth',
                    description: error.message || 'Sorry! Something went wrong. Please try again!'
                });
            });
    }

    isFormInvalid() {
        return !(this.state.name.validateStatus === 'success' &&
            this.state.username.validateStatus === 'success' &&
            this.state.email.validateStatus === 'success' &&
            this.state.password.validateStatus === 'success' &&
            this.state.answer.validateStatus === 'success'
        );
    }

    render() {
        return (
            <div>
                <div className="signup-container">
                    <h1 className="page-title">Sign Up</h1>
                    <div className="signup-content">
                        <Form onSubmit={this.handleSubmit} className="signup-form">
                            <FormItem
                                label="Full Name"
                                validateStatus={this.state.name.validateStatus}
                                help={this.state.name.errorMsg}>
                                <Input
                                    size="large"
                                    name="name"
                                    autoComplete="off"
                                    placeholder="Your full name"
                                    value={this.state.name.value}
                                    onChange={(event) => this.handleInputChange(event, this.validateName)} />
                            </FormItem>
                            <FormItem label="Username"
                                hasFeedback
                                validateStatus={this.state.username.validateStatus}
                                help={this.state.username.errorMsg}>
                                <Input
                                    size="large"
                                    name="username"
                                    autoComplete="off"
                                    placeholder="A unique username"
                                    value={this.state.username.value}
                                    onBlur={this.validateUsernameAvailability}
                                    onChange={(event) => this.handleInputChange(event, this.validateUsername)} />
                            </FormItem>
                            <FormItem
                                label="Email"
                                hasFeedback
                                validateStatus={this.state.email.validateStatus}
                                help={this.state.email.errorMsg}>
                                <Input
                                    size="large"
                                    name="email"
                                    type="email"
                                    autoComplete="off"
                                    placeholder="Your email"
                                    value={this.state.email.value}
                                    onBlur={this.validateEmailAvailability}
                                    onChange={(event) => this.handleInputChange(event, this.validateEmail)} />
                            </FormItem>
                            <FormItem
                                label="Password"
                                validateStatus={this.state.password.validateStatus}
                                help={this.state.password.errorMsg}>
                                <Input.Password
                                    size="large"
                                    name="password"
                                    type="password"
                                    autoComplete="off"
                                    placeholder="Password should include lowercase and uppercase"
                                    value={this.state.password.value}
                                    onChange={(event) => this.handleInputChange(event, this.validatePassword)} />
                            </FormItem>
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
                            {this.state.question.value !== '' && <FormItem label="Security Answer"
                                hasFeedback
                                validateStatus={this.state.answer.validateStatus}
                                help={this.state.answer.errorMsg}>
                                <Input
                                    size="large"
                                    name="answer"
                                    autoComplete="off"
                                    placeholder="Your Security Answer"
                                    value={this.state.answer.value}
                                    onChange={(event) => this.handleInputChange(event, this.validateAnswer)} />
                            </FormItem>}
                            <FormItem>
                                <Button type="primary"
                                    htmlType="submit"
                                    size="large"
                                    className="signup-form-button"
                                    disabled={this.isFormInvalid()}>Sign up</Button>
                            Already registed? <Link to="/login">Login now!</Link>
                            </FormItem>
                        </Form>
                    </div>
                </div>
                <div style={{ "display": "flex", "justify-content": "center" }}>
                    <img src={mainLogo} alt="Adaptive Auth Logo" />
                </div>
                <p style={{ "display": "flex", "justify-content": "center" }}><b>This platform is created to collect the users data which will be used to make an Adaptive Authentication System.</b></p>
            </div>
        );
    }

    // Validation Functions

    validateName = (name) => {
        if (name.length < NAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Name is too short (Minimum ${NAME_MIN_LENGTH} characters needed.)`
            }
        } else if (name.length > NAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Name is too long (Maximum ${NAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
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

    validateEmail = (email) => {
        if (!email) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email may not be empty'
            }
        }

        const EMAIL_REGEX = RegExp('[^@ ]+@[^@ ]+\\.[^@ ]+');
        if (!EMAIL_REGEX.test(email)) {
            return {
                validateStatus: 'error',
                errorMsg: 'Email not valid'
            }
        }

        if (email.length > EMAIL_MAX_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Email is too long (Maximum ${EMAIL_MAX_LENGTH} characters allowed)`
            }
        }

        return {
            validateStatus: null,
            errorMsg: null
        }
    }

    validateUsername = (username) => {
        if (username.length < USERNAME_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Username is too short (Minimum ${USERNAME_MIN_LENGTH} characters needed.)`
            }
        } else if (username.length > USERNAME_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Username is too long (Maximum ${USERNAME_MAX_LENGTH} characters allowed.)`
            }
        } else {
            return {
                validateStatus: null,
                errorMsg: null
            }
        }
    }

    validateUsernameAvailability() {
        // First check for client side errors in username
        const usernameValue = this.state.username.value;
        const usernameValidation = this.validateUsername(usernameValue);

        if (usernameValidation.validateStatus === 'error') {
            this.setState({
                username: {
                    value: usernameValue,
                    ...usernameValidation
                }
            });
            return;
        }

        this.setState({
            username: {
                value: usernameValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });

        checkUsernameAvailability(usernameValue)
            .then(response => {
                if (response.available) {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    this.setState({
                        username: {
                            value: usernameValue,
                            validateStatus: 'error',
                            errorMsg: 'This username is already taken'
                        }
                    });
                }
            }).catch(error => {
                // Marking validateStatus as success, Form will be recchecked at server
                this.setState({
                    username: {
                        value: usernameValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            });
    }

    validateEmailAvailability() {
        // First check for client side errors in email
        const emailValue = this.state.email.value;
        const emailValidation = this.validateEmail(emailValue);

        if (emailValidation.validateStatus === 'error') {
            this.setState({
                email: {
                    value: emailValue,
                    ...emailValidation
                }
            });
            return;
        }

        this.setState({
            email: {
                value: emailValue,
                validateStatus: 'validating',
                errorMsg: null
            }
        });

        checkEmailAvailability(emailValue)
            .then(response => {
                if (response.available) {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'success',
                            errorMsg: null
                        }
                    });
                } else {
                    this.setState({
                        email: {
                            value: emailValue,
                            validateStatus: 'error',
                            errorMsg: 'This Email is already registered'
                        }
                    });
                }
            }).catch(error => {
                // Marking validateStatus as success, Form will be recchecked at server
                this.setState({
                    email: {
                        value: emailValue,
                        validateStatus: 'success',
                        errorMsg: null
                    }
                });
            });
    }

    validatePassword = (password) => {

        if (!password) {
            return {
                validateStatus: 'error',
                errorMsg: 'Password may not be empty'
            }
        }

        if (password.length < PASSWORD_MIN_LENGTH) {
            return {
                validateStatus: 'error',
                errorMsg: `Password is too short (Minimum ${PASSWORD_MIN_LENGTH} characters needed.)`
            }
        }
        if (password.length > PASSWORD_MAX_LENGTH) {
            return {
                validationStatus: 'error',
                errorMsg: `Password is too long (Maximum ${PASSWORD_MAX_LENGTH} characters allowed.)`
            }
        }
        if ((password.toUpperCase() === password) || password.toLowerCase() === password) {
            return {
                validateStatus: 'error',
                errorMsg: 'Should Include lowercase and uppercase'
            }
        }
        else {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
    }

}

export default Signup;