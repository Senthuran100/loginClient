import React, { Component } from 'react';
import './App.css';
import Login from './user/login/Login';
import LoginHome from './LoginHome';
import Signup from './user/signup/Signup';
import AdaptiveOutput from './user/adaptiveOutput/AdaptiveOutput';
import Profile from './user/profile/Profile';
import AppHeader from './common/AppHeader';
import { ACCESS_TOKEN } from './constants';
import { getCurrentUser } from './util/APIUtils';
import {
  Route,
  withRouter,
  Switch,
  Redirect,
  HashRouter
} from 'react-router-dom';
import { Layout, notification } from 'antd';
const { Content } = Layout;
let totalX = 0;
let totalY = 0;
let total = 0;
let rightClick = 0;
let leftClick = 0;
let mouseDown = 0;
let mouseUp = 0;
let mouseObject
class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      prevEvent: null,
      secondAuthentication: false
    }
    this.handleLogout = this.handleLogout.bind(this);
    this.loadCurrentUser = this.loadCurrentUser.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.adaptiveLogin = this.adaptiveLogin.bind(this);
    this.handleSecondLogin = this.handleSecondLogin.bind(this);

    notification.config({
      placement: 'topRight',
      top: 70,
      duration: 3,
    });

  }
  componentDidMount() {
    if (localStorage.getItem('user') && localStorage.getItem(ACCESS_TOKEN)) {
      // console.log(JSON.parse(localStorage.getItem('user')));
      this.setState({
        currentUser: JSON.parse(localStorage.getItem('user')),
        isAuthenticated: true,
        isLoading: false
      });
    } else {
      this.setState({
        currentUser: null,
        isAuthenticated: false,
      });
    }
  }

  loadCurrentUser() {
    this.setState({
      isLoading: true
    });
    getCurrentUser()
      .then(response => {
        this.setState({
          currentUser: response,
          isAuthenticated: true,
          isLoading: false
        });
        this.props.history.push(`/accessHome/${response.username}`);
      }).catch(error => {
        this.setState({
          isLoading: false
        });
      });

  }

  adaptiveLogin() {
    this.setState({ secondAuthentication: true })
    this.props.history.push(`/adaptiveLogin`);
  }

  handleLogout(redirectTo = "/login", notificationType = "success", description = "You're successfully logged out.") {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem('user')
    this.setState({
      currentUser: null,
      isAuthenticated: false
    });

    this.props.history.push(redirectTo);

    notification[notificationType]({
      message: 'Adaptive Auth',
      description: description,
    });
  }

  handleEvent = (event) => {
    if (window.location.pathname === '/login') {
      total += Math.sqrt(Math.abs(event.movementX) * Math.abs(event.movementX) + Math.abs(event.movementY) * Math.abs(event.movementY))
      totalX += Math.abs(event.movementX);
      totalY += Math.abs(event.movementY)

      if (event.type === "mousedown") {
        mouseDown++;
      }
      else if (event.type === "mouseup") {
        mouseUp++;
      }
      if (event.nativeEvent.which === 1) {
        leftClick++;
      } else if (event.nativeEvent.which === 3) {
        rightClick++;
      }

      mouseObject = {
        'totalX': totalX,
        'totalY': totalY,
        'total': total,
        'leftClick': leftClick,
        'rightClick': rightClick,
        'mouseDown': mouseDown,
        'mouseUp': mouseUp
      }
    }
    if (window.location.pathname !== '/login' && totalX !== 0) {
      totalX = 0;
      totalY = 0;
      total = 0;
      leftClick = 0;
      rightClick = 0;
      mouseDown = 0;
      mouseUp = 0;
    }
  }

  mouseObjects() {
    return mouseObject
  }

  handleLogin() {
    notification.success({
      message: 'Adaptive Auth',
      description: "You're successfully logged in.",
    });
    this.loadCurrentUser();
  }

  handleSecondLogin() {
    notification.success({
      message: 'Adaptive Auth',
      description: "You're successfully logged in.",
    });
    this.loadCurrentUser();
  }

  render() {
    return (
      <Layout className="app-container" onMouseDown={this.handleEvent} onMouseUp={this.handleEvent} onMouseMove={this.handleEvent}>
        <AppHeader isAuthenticated={this.state.isAuthenticated}
          currentUser={this.state.currentUser}
          onLogout={this.handleLogout} />

        <Content className="app-content">
          <div className="container" style={{ minHeight: '1025px' }}>
            <HashRouter>
              {this.state.secondAuthentication && <Route exact path="/adaptiveLogin"
                render={(props) => <AdaptiveOutput username={this.state.currentUser} loadCurrentUser={this.loadCurrentUser} onLogin={this.handleLogin} {...props} />}
              ></Route>}
              <Route path="/accessHome/:username"
                render={(props) => <LoginHome isAuthenticated={this.state.isAuthenticated} username={this.state.currentUser} {...props} />}>
              </Route>
              <Route path="/login"
                render={(props) => !this.state.isAuthenticated ?
                  (<Login username={this.state.currentUser} onLogin={this.handleLogin} mouseObject={this.mouseObjects} adaptiveLogin={this.adaptiveLogin} {...props} />) :
                  <Redirect to={{ pathname: `/accessHome/${this.state.currentUser.username}` }} />
                }></Route>
              {!this.state.isAuthenticated && <Route path="/signup" component={Signup} />}
              <Route path="/users/:username"
                render={(props) => <Profile isAuthenticated={this.state.isAuthenticated} currentUser={this.state.currentUser} {...props} />}>
              </Route>
              <Route exact path="/*">
                <Redirect to="/login" />
              </Route>
            </HashRouter>
          </div>

        </Content>
      </Layout>
    );
  }
}

export default withRouter(App);
