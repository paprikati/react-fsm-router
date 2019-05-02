const parsePath = require('parse-path');
const async = require('async');
// TODO actual integration with xstate driven by options{xstate:true}
// TODO add guards
// TODO exception handling for invalid strings (default to initial route) rather than erroring
module.exports = function(fsm, transitions, options, callback) {
    let initialRoute = getInitialRoute(fsm);
    let parsedURL = parsePath(window.location.href);

    let router = {
        config: {
            transitions,
            fsm
        },
        vals: {
            state: initialRoute.join('.'),
            route: initialRoute,
            history: [], // array of arrays where each array is a nested path
            queryMap: parsedURL.query // object representing the current querystring
        },
        transition: function(transitionKey, args, cb) {
            // update the history
            this.vals.history.push(this.vals.path);
            // change the state
            this.vals.route = getNewRoute(
                transitionKey,
                this.vals.route,
                this.config.fsm
            );
            this.vals.state = this.vals.route.join('.');

            // call the transition
            this.config.transitions[transitionKey](
                { router: this, args },
                () => {
                    // this.vals.queryMap = queryMap;
                    console.log('in callback');
                    // update the url
                    if ('pushState' in window.history) {
                        let newURL = getBaseURL(parsedURL.href);
                        if (this.vals.route.length > 0) {
                            let route = this.vals.route.join('/');
                            newURL = `${newURL}/${route}`;
                        }
                        if (
                            this.vals.queryMap &&
                            Object.keys(this.vals.queryMap).length > 0
                        ) {
                            let queryString = stringifyQueryMap(
                                this.vals.queryMap
                            );
                            newURL = `${newURL}?${queryString}`;
                        }

                        window.history.pushState({}, '', newURL);
                    }
                    cb(this);
                }
            );
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
        clearHistory: function() {
            this.vals.history = [];
            return;
        },
        getQueryMap: function() {
            return this.vals.queryMap;
        },
        clearQueryMap: function() {
            this.vals.queryMap = {};
        },
        setQueryMap: function(delta) {
            this.vals.queryMap = Object.assign(this.vals.queryMap, delta);
        }
    };

    let parsedPath = parsedURL.pathname.split('/');
    // remove initial /
    parsedPath.splice(0, 1);

    console.log('about to hit parsedPath IF');

    // for each argument in the path, if it doesnt match the initial state, trigger a transition. always give the transition the full router in case its useful
    if (parsedPath) {
        initialRoute = parsedPath;
        router.vals.route = getFullInitialRoute(fsm, initialRoute);
        router.vals.state = router.vals.route.join('.');
        walkStateTree(parsedPath, fsm, transitions, router, routerToReturn => {
            if ('pushState' in window.history) {
                let newURL = `${getBaseURL(
                    parsedURL.href
                )}/${router.vals.route.join('/')}${
                    parsedURL.search ? `?${parsedURL.search}` : ''
                }`;
                window.history.pushState({}, '', newURL);
            }
            callback(routerToReturn);
        });
    } else {
        callback(router);
    }
};

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
    return [...initialRoute, ...getInitialRoute(fsmLocation)];
}

function getNewRoute(transitionKey, currentStatePath, configFSM) {
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
function walkStateTree(parsedPath, rawFSM, rawTransitions, router, callback) {
    let fsmLocation = rawFSM;

    for (let path of parsedPath) {
        if (path === fsmLocation.initial) {
            fsmLocation = fsmLocation.states[path];
            continue;
        }

        let initialFsmLocation = fsmLocation.states[fsmLocation.initial];

        // find the transition which gets to our bit
        let transitions = Object.keys(initialFsmLocation.on);
        //TODO replace with until
        async.eachSeries(
            transitions,
            (transition, cb) => {
                if (initialFsmLocation.on[transition] === path) {
                    rawTransitions[transition]({ router }, () => {
                        fsmLocation = fsmLocation.states[path];
                        cb();
                    });
                } else {
                    cb();
                }
            },
            () => {
                callback(router);
            }
        );
    }
}

// TODO fix so this works when youre in a subdomain
function getBaseURL(href) {
    let arr = href.split('/');
    let ourArr = arr.splice(0, 3);
    return ourArr.join('/');
}

function stringifyQueryMap(map) {
    const ret = [];
    for (let d in map) {
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(map[d]));
    }
    return ret.join('&');
}
