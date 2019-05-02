import React, { Component } from 'react';
import Frame from './Frame';
import Router from 'react-fsm-router';
// import Router from './router';
import routing from './routing';

let ourRouter = new Router(routing.fsm, routing.transitions);

export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = { router: ourRouter };
        this.transition = this.transition.bind(this);
    }
    transition(str, args) {
        this.state.router.transition(str, args, router => {
            this.setState({ router });
        });
    }

    render() {
        return (
            <Frame router={this.state.router} transition={this.transition} />
        );
    }
}
