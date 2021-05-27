import React, { Component } from 'react';
import { login } from '../../util/APIUtils';
import { currentTime, arraySum } from '../../util/Helpers';
import './Login.css';
import { Link } from 'react-router-dom';
import { ACCESS_TOKEN, USERNAME, AUTHFACTOR } from '../../constants';
import 'antd/dist/antd.css';
import { Form, Input, Button, Icon, notification } from 'antd';
import ClientJS from 'clientjs';
const windowClient = new window.ClientJS();
const stringHash = require("string-hash");

const { detect } = require('detect-browser');
const browser = detect();
const FormItem = Form.Item;
let maxSpeed = 0, prevSpeed = 0, speed = 0, maxPositiveAcc = 0, maxNegativeAcc = 0;
let prevEvent, currentEvent
let dwellTimes = {};
let dwellTimesArray = []
let start = 0;
let flightTimesArray = []
let startTime = 0;
let upDownTimeArray = []
let browserInfo = {}

let timeDiffUsername = 0
let startTimeUsername = 0;
let endTimeUsername = 0;
let usernameCount = 0;
let usernameWPS = 0;

let timeDiffPassword = 0;
let startTimePassword = 0;
let endTimePassword = 0;
let passwordCount = 0;
let passwordWPS = 0;
let totalTimeSpent = 0;

let dwellTimeSum = 0;
let flightTimesSum = 0;
let upDownTimeSum = 0;
let countShift = 0, countCapslock = 0, countKey = 0;
class Login extends Component {

    render() {
        const AntWrappedLoginForm = Form.create()(LoginForm)
        return (

            <div className="login-container" >
                <h1 className="page-title">Login</h1>
                <div className="login-content">
                    <AntWrappedLoginForm onLogin={this.props.onLogin} mouseObject={this.props.mouseObject}
                        adaptiveLogin={this.props.adaptiveLogin} />
                </div>
            </div>
        );
    }
}

class LoginForm extends Component {
    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            currentUser: null,
            isAuthenticated: false,
            isLoading: false,
            details: null
        }
    }

    canvasFingerPrint = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const txt = 'ADAPTIVE_AUTHENTICATION';
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial'";
        ctx.textBaseline = "alphabetic";
        ctx.rotate(.05);
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText(txt, 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText(txt, 4, 17);

        return stringHash(canvas.toDataURL());
    }

    generateBrowserHash = () => {
        const browserAttribute = [windowClient.getUserAgentLowerCase(), windowClient.getPlugins(), windowClient.getFonts(), windowClient.getMimeTypes()]
        const deviceAttribute = [windowClient.getOS(), windowClient.getOSVersion(), windowClient.getCPU(), windowClient.getColorDepth(), windowClient.getCurrentResolution(),
        windowClient.isJava() && windowClient.getJavaVersion(), windowClient.getLanguage()]
        return { 'browserAttribute': stringHash(browserAttribute.join('-')), 'deviceAttribute': stringHash(deviceAttribute.join('-')) }
    }

    componentDidMount() {

        fetch(
            "https://geolocation-db.com/json/0f761a30-fe14-11e9-b59f-e53803842572"
        )
            .then(response => response.json())
            .then(data => this.setState({ details: data }));

        document.addEventListener('mousemove', (event) => {
            currentEvent = event
        });

        setInterval(function () {
            if (currentEvent && prevEvent) {
                let movementX = Math.abs(currentEvent.pageX - prevEvent.pageX);
                let movementY = Math.abs(currentEvent.pageY - prevEvent.pageY);
                let movement = Math.sqrt(movementX * movementX + movementY * movementY);
                speed = 10 * movement; //current speed
                maxSpeed = Math.round(speed > maxSpeed ? (maxSpeed = speed) : maxSpeed);

                let acceleration = 10 * (speed - prevSpeed);

                if (acceleration > 0) {
                    maxPositiveAcc = Math.round(acceleration > maxPositiveAcc ? (maxPositiveAcc = acceleration) : maxPositiveAcc);
                } else {
                    maxNegativeAcc = Math.round(acceleration < maxNegativeAcc ? (maxNegativeAcc = acceleration) : maxNegativeAcc);
                }
            }
            prevEvent = currentEvent
            prevSpeed = speed;
        }, 100);
        let canvasFingerPrint;
        const element = document.createElement('canvas');
        if (!!(element.getContext && element.getContext('2d'))) {
            canvasFingerPrint = this.canvasFingerPrint();
        }
        // console.log('canvasFingerPrint', canvasFingerPrint, this.generateBrowserHash());
        browserInfo = {
            "UserAgent": windowClient.getUserAgentLowerCase(), "Plugins": windowClient.getPlugins(),
            "TimeZone": windowClient.getTimeZone(), "Fonts": windowClient.getFonts(), "MimeTypes": windowClient.getMimeTypes(),
            "CPU": windowClient.getCPU(), "Device": windowClient.getDevice(), "browser": windowClient.getBrowser(),
            "SoftwareVersion": windowClient.getSoftwareVersion(), "Resolution": windowClient.getAvailableResolution(),
            "ColorDepth": windowClient.getColorDepth(), "browserVersion": windowClient.getBrowserVersion(), "OS": windowClient.getOS(),
            "OS_version": windowClient.getOSVersion(), "Flash": windowClient.isFlash() && windowClient.getFlashVersion(), "Engine": windowClient.getEngine(),
            "EngineVersion": windowClient.getEngineVersion(), "canvasFingerPrint": canvasFingerPrint, ...this.generateBrowserHash()
        }

    }

    componentWillUnmount() {
        dwellTimesArray = []
        dwellTimeSum = 0;
        flightTimesArray = [];
        flightTimesSum = 0;
        upDownTimeArray = []
        upDownTimeSum = 0, startTime = 0,
            start = 0, startTimeUsername = 0, endTimeUsername = 0, timeDiffUsername = 0, usernameCount = 0, usernameWPS = 0,
            timeDiffPassword = 0, startTimePassword = 0, endTimePassword = 0, passwordCount = 0, passwordWPS = 0, totalTimeSpent = 0,
            countShift = 0, countCapslock = 0, countKey = 0,
            maxSpeed = 0, prevSpeed = 0, speed = 0, maxPositiveAcc = 0, maxNegativeAcc = 0,
            prevEvent = null, currentEvent = null, browserInfo = {}, dwellTimes = {};
    }

    onKeyPressed(e) {
        // console.log(e.key);
        if (!dwellTimes[e.which])
            dwellTimes[e.which] = new Date().getTime();
        if (!start) {
            start = new Date().getTime();
        } else {
            let flighttime = new Date().getTime() - start;
            start = null
            flightTimesArray.push({ "key": e.key, "flightTime": flighttime })
            // console.log('FlightTime', flightTimesArray, arraySum(flightTimesArray, 'flightTime'));
        }
        if (startTime) {
            let upDownTime = new Date().getTime() - startTime;
            startTime = null;
            upDownTimeArray.push({ 'key': e.key, 'upDownTime': upDownTime })
            // console.log('upDownTimeArray', upDownTimeArray, arraySum(upDownTimeArray, 'upDownTime'));
        }
        if (e.key === 'CapsLock') {
            countCapslock++;
        }
        if (e.key === 'Shift') {
            countShift++;
        }
        countKey++;
    }
    onKeyRelease(e) {

        // console.log(e.key);
        let dwellTime = new Date().getTime() - dwellTimes[e.which];

        dwellTimesArray.push({ "key": e.key, "dwellTime": dwellTime })
        delete dwellTimes[e.which];
        if (!startTime) {
            startTime = new Date().getTime()
        }
    }

    handleSubmit(event) {

        event.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const { CPU, TimeZone, Resolution, ColorDepth, Flash, UserAgent } = browserInfo;
                const { country_code, country_name, state, city,IPv4 } = this.state.details;
                if (browser) {
                    values.browser = {
                        ...browser, CPU, TimeZone, Resolution, ColorDepth, Flash,
                        UserAgent, country_code, country_name, state, city, IPv4
                    };
                    values.location = this.state.details;
                }
                dwellTimeSum = arraySum(dwellTimesArray, 'dwellTime')
                flightTimesSum = arraySum(flightTimesArray, 'flightTime')
                upDownTimeSum = arraySum(upDownTimeArray, 'upDownTime')

                const mouseEvent = {
                    "maxPositiveAcc": maxPositiveAcc,
                    "maxNegativeAcc": maxNegativeAcc,
                    "maxSpeed": maxSpeed,
                    ...this.props.mouseObject()
                }
                const keyBoardEvent = {
                    "usernameWPS": usernameWPS,
                    "passwordWPS": passwordWPS,
                    "totalTimeSpent": totalTimeSpent,
                    "countShift": countShift,
                    "countCapslock": countCapslock,
                    "countKey": countKey,
                    "dwellTimeAverage": dwellTimeSum / dwellTimesArray.length,
                    "flightTimesAverage": flightTimesSum / flightTimesArray.length,
                    "upDownTimeAverage": upDownTimeSum / upDownTimeArray.length
                }
                values.mouseEvent = mouseEvent
                values.keyBoardEvent = keyBoardEvent
                values.browserInfo = browserInfo
                const loginRequest = Object.assign({}, values);
                // console.log('values', loginRequest);
                this.setState({ isLoading: true })
                login(loginRequest)
                    .then(response => {
                        this.setState({ isLoading: false })
                        localStorage.setItem(ACCESS_TOKEN, response.accessToken);
                        localStorage.setItem(USERNAME, response.username)
                        if (response.authfactor === 'security_question' || response.authfactor === 'OTP') {
                            localStorage.setItem(AUTHFACTOR, response.authfactor);
                            this.props.adaptiveLogin();
                        } else {
                            this.props.onLogin();
                        }
                    }).catch(error => {
                        this.setState({ isLoading: false })
                        if (error.status === 401) {
                            notification.error({
                                message: 'Adaptive Auth',
                                description: 'Your Username or Password is incorrect. Please try again!'
                            });
                        } else {
                            notification.error({
                                message: 'Adaptive Auth',
                                description: error.message || 'Sorry! Something went wrong. Please try again!'
                            });
                        }
                    });
            }
        });
    }

    onFocusUsername = (e) => {
        if (startTimeUsername === 0) {
            startTimeUsername = currentTime();
        }
        usernameCount = e.target.value.length;
    }

    onBlurUsername = (e) => {
        if (endTimeUsername === 0 && e.target.value.length > 0) {
            endTimeUsername = currentTime()
        }
        if (endTimeUsername !== 0 && startTimeUsername !== 0) {
            timeDiffUsername = endTimeUsername - startTimeUsername;
            usernameWPS = usernameCount / timeDiffUsername;
        }
    }

    onFocusPassword = (e) => {
        if (startTimePassword === 0) {
            startTimePassword = currentTime();
        }
        passwordCount = e.target.value.length;
    }

    onBlurPassword = (e) => {
        if (endTimePassword === 0 && e.target.value.length > 0) {
            endTimePassword = currentTime()
        }
        if (endTimePassword !== 0 && startTimePassword !== 0) {
            timeDiffPassword = endTimePassword - startTimePassword;
            passwordWPS = passwordCount / timeDiffPassword;
        }
        if (endTimePassword !== 0 && startTimeUsername !== 0) {
            totalTimeSpent = endTimePassword - startTimeUsername;
        }

    }


    render() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form" onMouseDown={this.handleEvent} onMouseUp={this.handleEvent} >
                <FormItem>
                    {getFieldDecorator('usernameOrEmail', {
                        rules: [{ required: true, message: 'Please input your username or email!' }],
                    })(
                        <Input
                            prefix={<Icon type="user" />}
                            size="large"
                            name="usernameOrEmail"
                            placeholder="Username or Email"
                            onKeyDown={this.onKeyPressed}
                            onKeyUp={this.onKeyRelease}
                            style={{ "width": "500px" }}
                            autoComplete="off"
                            fillText={false}
                            onFocus={this.onFocusUsername}
                            onChange={this.onFocusUsername}
                            onBlur={this.onBlurUsername}
                            onPaste={e => {
                                e.preventDefault();
                                return false
                            }}
                        />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input.Password
                            prefix={<Icon type="lock" />}
                            size="large"
                            name="password"
                            type="password"
                            placeholder="Password"
                            onKeyDown={this.onKeyPressed}
                            onKeyUp={this.onKeyRelease}
                            style={{ "width": "500px" }}
                            autoComplete="off"
                            onFocus={this.onFocusPassword}
                            onChange={this.onFocusPassword}
                            onBlur={this.onBlurPassword}
                            onPaste={e => {
                                e.preventDefault();
                                return false
                            }}
                        />
                    )}
                </FormItem>
                <FormItem>
                    <Button type="primary" htmlType="submit" size="large" className="login-form-button" style={{ "width": "500px" }}
                        loading={this.state.isLoading}>Login</Button>
                    Or <Link to="/signup">register now!!!</Link>
                </FormItem>
            </Form>
        );
    }
}


export default Login;