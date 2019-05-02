# React FSM Router

*Building a react router using statecharts concepts*

This project is in its very early stages! Feature requests are definitely welcome.

## Quick Start

Clone the repo to look at the quickstart example

To build a router, you need an fsm (finite state machine) and a list of transitions.

### FSM
as per xstate - you can use the xstate viz tool to help build these. It currently only supports the simple syntax as shown below.
```
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
```

### Transitions
Each transition must have a unique key. The transitions receive two arguments:
* {router, args}
  * router is the current state of the router
  * args are what was passed as the second argument to router.transition. This will always be undefined if a transition is called when initialising your app for the first time (i.e. someone has navigated directly to that state via a URL)
* callback - a callback that must be called to end the transition

```
const transitions = {
    TOGGLE: function({ args, router }, cb) {
        console.log('toggling');
        router.clearQueryMap();
        cb();
    },
    CHANGE_PART: function({ args, router }, cb) {
        console.log('changing part');
        cb();
    }
};
```

### Initialise the Router

import the Router and initialise using the fsm and transitions objects:

```
import Router from 'react-fsm-router';
let myRouter = new Router(fsm, transitions);
```

you can trigger a transition by calling

```
router.transition('TOGGLE');
```

## Router API

There are a few methods available on the `Router` object:
* `getRoute` returns an array of strings representing the route (e.g. `['section1','part1']`)
* `getState` returns the route in xstate form (e.g. `section1.part1`)
* `getHistory` returns an array of arrays, where each array represents a route the user has gone to
* `getQueryMap` returns the query map (e.g. `{id:'123'}`)
* `clearQueryMap` clears the query map