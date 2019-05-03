import React, { Component } from 'react';
import Section1 from './sections/section1';
import Section2 from './sections/section2';

export default class Frame extends Component {
    render() {
        const {router} = this.props;
        console.log(router.getQueryMap());

        // check if its section 1 or section 2
        let appContent =
            router.getRoute()[0] == 'section1' ? (
                <div>
                    <button
                        onClick={() => router.TRANSITION('CHANGE_PART')}>
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
                <button onClick={() => router.TRANSITION('TOGGLE')}>
                    Toggle
                </button>
                {appContent}
            </div>
        );
    }
}
