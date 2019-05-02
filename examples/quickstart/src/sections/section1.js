import React, { Component } from 'react';

export default class Section1 extends Component {
    render() {
        return (
            <div style={{ color: this.props.color }}>
                Section 1, {this.props.part}
            </div>
        );
    }
}
