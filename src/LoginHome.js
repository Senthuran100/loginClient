import React, { Component } from 'react';
import { getUserProfile } from './util/APIUtils';
import LoadingIndicator from './common/LoadingIndicator';
import NotFound from './common/NotFound';
import ServerError from './common/ServerError';
import CheckAuthentication from './common/CheckAuthentication';
import { ACCESS_TOKEN } from './constants';
import _ from 'lodash';
import { Card, Divider, Tag } from 'antd';

class LoginHome extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            isLoading: false
        }
    }

    loadUserProfile = (username) => {
        const _this = this;
        if (username !== null && localStorage.getItem(ACCESS_TOKEN)) {
            _this.setState({
                isLoading: true
            });
            // console.log('username', username);
            getUserProfile(username)
                .then(response => {
                    localStorage.setItem("user", JSON.stringify(response));
                    _this.setState({
                        user: response,
                        isLoading: false
                    });
                }).catch(error => {
                    if (error.status === 404) {
                        _this.setState({
                            notFound: true,
                            isLoading: false
                        });
                    } else {
                        _this.setState({
                            serverError: true,
                            isLoading: false
                        });
                    }
                });
            // console.log('username', username);

        }
    }

    componentDidMount() {
        const username = this.props.match.params.username;
        this.loadUserProfile(username);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.match.params.username !== nextProps.match.params.username) {
            this.loadUserProfile(nextProps.match.params.username);
        }
    }

    render() {
        if (this.state.isLoading) {
            return <LoadingIndicator />;
        }

        if (this.state.notFound) {
            return <NotFound />;
        }

        if (this.state.serverError) {
            return <ServerError />;
        }
        if (_.isEmpty(localStorage.getItem(ACCESS_TOKEN))) {
            return <CheckAuthentication {...this.props} />
        }

        return (
            <div className="App-content">
                {
                    this.state.user ? (
                        <React.Fragment>
                            <Tag color="green" style={{ "padding": "10px" }}>You are logged in as <b>{this.state.user.name}</b></Tag>
                            <Divider orientation="left"></Divider>
                            <Card title="Adaptive Authentication" style={{ 'width': '100%' }}>
                                <p>Adaptive authentication, also commonly referred to as risk-based authentication, is an authentication paradigm that attempts to match the required
                                authentication credentials to the perceived risk of the connection or authorizations requested. The objective is to try to reduce the authentication
                                burden on users and provide a better experience on the one hand, while enforcing strong authentication where it is most needed on the other. For example,
                                a user connecting via VPN from his known home network using a company-managed PC will not be required to present any additional authentication credentials
                                beyond those provided by his PC because the connection request is not perceived to be high-risk. A connection from an unknown WiFi during “odd” hours of
                                the day would require the user to produce additional authentication in the form of a password, OTP, or both, because the connection exhibits risk indicators
                                 that elevate the perceived risk.</p>
                                <p>This platform is created with the aim of collecting users data in order to make an adaptive authentication system. While login to this application, various
                                information(for example:-device, browser, mouse dynamics, keystroke dynamics etc.) of the user will be collected. Then those information will be used to
                                    make an Adaptive Authentication engine.</p>
                            </Card>
                            <Divider orientation="left"></Divider>

                            <Card title="User info" style={{ 'width': '100%' }}>
                                <img src="https://www.mss.ca/wp-content/uploads/2020/01/under-maintenance.png" />

                            </Card>
                        </React.Fragment>
                    ) : null
                }
            </div>
        );
    }
}

export default LoginHome;