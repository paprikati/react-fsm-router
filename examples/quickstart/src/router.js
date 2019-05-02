import parsePath from 'parse-path';
// TODO actual integration with xstate driven by options{xstate:true}
// TODO add guards
export default function Router(fsm, transitions, options) {
    let initialRoute = getInitialRoute(fsm);
    let parsedURL = parsePath(window.location.href);
    let parsedPath = parsedURL.pathname.split('/');
    // remove initial /
    parsedPath.splice(0, 1);
    // remove final /

    // for each argument in the path, if it doesnt match the initial state, trigger a transition. always give the transition the full router in case its useful
    if (parsedPath) {
        initialRoute = parsedPath;
        initialRoute = getFullInitialRoute(fsm, initialRoute);
        walkStateTree(parsedPath, fsm, transitions);
    }
    if ('pushState' in window.history) {
        console.log(initialRoute.join('/'));
        let newURL = `${getBaseURL(parsedURL.href)}/${initialRoute.join('/')}`;
        window.history.pushState({}, '', newURL);
    }

    return {
        config: {
            transitions,
            fsm
        },
        vals: {
            state: initialRoute.join('.'),
            route: initialRoute,
            history: [], // array of arrays where each array is a nested path
            queryMap: {} // object representing the current querystring
        },
        transition: function(transitionKey, ...args) {
            // update the history
            this.vals.history.push(this.vals.path);
            //change the state
            this.vals.route = getNewRoute(
                transitionKey,
                this.vals.route,
                this.config.fsm
            );
            this.vals.state = this.vals.route.join('.');

            // call the transition
            this.config.transitions[transitionKey](args);

            // update the url
            if ('pushState' in window.history) {
                let newURL = `${getBaseURL(
                    parsedURL.href
                )}/${this.vals.route.join('/')}`;
                window.history.pushState({}, '', newURL);
            }

            return this;
        }, // some function to trigger a transition
        getRoute: function() {
            return this.vals.route;
        },
        getState: function() {
            return this.vals.state;
        },
        getHistory: function() {
            return this.vals.history;
        },
        getQueryMap: function() {
            return this.vals.queryMap;
        }
    };
}

function getInitialRoute(sm, current = []) {
    if (!sm.initial) {
        return current;
    }
    current.push(sm.initial);
    if (sm.states[sm.initial].states) {
        current = [...current, ...getInitialRoute(sm.states[sm.initial])];
    }
    return current;
}

function getFullInitialRoute(fsm, initialRoute) {
    let fsmLocation = fsm;
    // get to the right bit of the fsm
    initialRoute.forEach(ea => {
        fsmLocation = fsmLocation.states[ea];
    });
    console.log(fsmLocation);
    return [...initialRoute, ...getInitialRoute(fsmLocation)];
}

function getNewRoute(transitionKey, currentStatePath, configFSM) {
    console.log({ transitionKey, currentStatePath, configFSM });
    // walk the tree down the FSM, finding the first transition with this key
    let fsmLocation = configFSM;
    let newRoute = [];
    for (let stateKey of currentStatePath) {
        let thisStateLocation = fsmLocation.states[stateKey];
        if (thisStateLocation.on[transitionKey]) {
            let newStateKey = thisStateLocation.on[transitionKey];
            newRoute.push(newStateKey);
            let initialRoute = getInitialRoute(fsmLocation.states[newStateKey]);
            newRoute.push(...initialRoute);
            return newRoute;
        }
        fsmLocation = thisStateLocation;
        // push after the IF as now we know we're not leaving this state
        newRoute.push(stateKey);
    }
}
function walkStateTree(parsedPath, rawFSM, rawTransitions) {
    let fsmLocation = rawFSM;

    for (let path of parsedPath) {
        if (path === fsmLocation.initial) {
            fsmLocation = fsmLocation.states[path];
            continue;
        }

        console.log('fsm location');
        console.log(fsmLocation);

        let initialFsmLocation = fsmLocation.states[fsmLocation.initial];
        console.log('initialfsm');
        console.log(initialFsmLocation);
        // find the transition which gets to our bit
        for (let transition in initialFsmLocation.on) {
            if (initialFsmLocation.on[transition] === path) {
                rawTransitions[transition](); // TODO HANDLE ASYNC
                fsmLocation = fsmLocation.states[path];
                break;
            }
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
    TOGGLE: function(args, cb) {
        console.log('toggling');
        cb();
    },
    CHANGE_PART: function(ars, cb) {
        console.log('changing part');
        cb();
    }
};

// TODO fix so this works when youre in a subdomain
function getBaseURL(href) {
    let arr = href.split('/');
    let ourArr = arr.splice(0, 3);
    return ourArr.join('/');
}
