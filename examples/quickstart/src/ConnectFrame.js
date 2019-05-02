import Router from './router';
import routing from './routing';
import React, { Component } from 'react';
import Frame from './Frame';

let ourRouter = new Router(routing.fsm, routing.transitions);

export default class ConnectFrame extends Component {
    constructor(props) {
        super(props);
        this.state = { router: ourRouter };
        this.transition = this.transition.bind(this);
    }
    transition(str, ...args) {
        this.setState({
            router: this.state.router.transition(str, ...args)
        });
    }

    render() {
        return (
            <Frame router={this.state.router} transition={this.transition} />
        );
    }
}
