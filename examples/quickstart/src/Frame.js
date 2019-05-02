import React, { Component } from 'react';
import Section1 from './sections/section1';
import Section2 from './sections/section2';

export default class Frame extends Component {
    render() {
        const router = this.props.router;
        // console.log('re-rendering frame');
        console.log(router.getHistory());
        // check if its section 1 or section 2
        let appContent =
            router.getRoute()[0] == 'section1' ? (
                <div>
                    <button
                        onClick={() => this.props.transition('CHANGE_PART')}>
                        Change Part
                    </button>
                    <Section1
                        color={router.getQueryMap().color}
                        part={router.getRoute()[1]}
                    />
                </div>
            ) : (
                <Section2 />
            );

        return (
            <div className="App">
                <button onClick={() => this.props.transition('TOGGLE')}>
                    Toggle
                </button>
                {appContent}
            </div>
        );
    }
}
