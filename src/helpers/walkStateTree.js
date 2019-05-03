import {eachSeries} from 'async';

export default function walkStateTree(parsedPath, rawFSM, rawTransitions, router, callback) {
    console.log('walking state tree');
    let fsmLocation = rawFSM;
    
    let i = 0;
    for (let path of parsedPath) {
        i++;
        if (path === fsmLocation.initial) {
            fsmLocation = fsmLocation.states[path];
            //TODO if this is the end, need to callback...
            if(i === parsedPath.length){
                callback();
            }
            continue;
        }

        let initialFsmLocation = fsmLocation.states[fsmLocation.initial];

        // find the transition which gets to our bit
        let transitions = Object.keys(initialFsmLocation.on);
        console.log(transitions);
        if(transitions.length == 0){
            callback();
        }
        //TODO replace with until
        eachSeries(
            transitions,
            (transition, c1) => {
                console.log('iterating through transition: '+transition);
                if (initialFsmLocation.on[transition] === path) {
                    console.log('calling a transition');
                    rawTransitions[transition]({ router }, () => {
                        fsmLocation = fsmLocation.states[path];
                        c1();
                    });
                } else {
                    console.log('dont need to call this transition');
                    c1();
                }
            },
            () => {
                console.log('finished looping through transitions');

                callback();
            }
        );
    }
}