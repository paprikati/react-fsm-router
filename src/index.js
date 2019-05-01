// TODO actual integration with xstate driven by options{xstate:true}

function Router(fsm, transitions, options){
    let initialState = getInitialState(fsm);

    var ret = {
        raw: {
            transitions, fsm
        },
        state: initialState,
        path: initialState.split('.'),
        transition: function(transitionKey, ...args){
            // find the transition
            getTransition(transitionKey, this.path, this.raw.transitions, this.raw.fsm);

        }, // some function to trigger a transition
        history: [], // array of arrays where each array is a nested path
        queryMap: {} // object representing the current querystring
    };

}

function getInitialState(sm){
    let state = sm.initial;
    if (sm.states[sm.initial].states){
        state = `${state}.${getInitialState(sm.states[sm.initial])}`;
    }
    return state;
}

function getTransition(transitionKey, currentStatePath, rawTransitions, rawFSM){
    // walk the tree down the FSM, finding the first transition with this key
    let fsmLocation = rawFSM;
    for (let stateKey of currentStatePath){
        fsmLocation = fsmLocation.states[stateKey];
        if (fsmLocation.on[transitionKey]){
            return rawTransitions[transitionKey];
        }
    }

}


const fsm = {
    initial: 'section1',
    states: {
        section1: {
            on: {
                TOGGLE: 'section2'
            },
            initial: 'part1',
            states: {
                part1: {
                    on: {
                        CHANGE_PART: 'part2'
                    }
                },
                part2: {
                    on: {
                        CHANGE_PART: 'part1'
                    }
                }
            }
        },
        section2: {
            on: {
                TOGGLE: 'section1'
            }
        }
    }
};

const transitions = {
    TOGGLE: function(args, cb){
        console.log('toggling');
        cb();
    },
    CHANGE_PART: function(ars, cb){
        console.log('changing part');
        cb();
    }
};
