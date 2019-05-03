# React FSM Router

*Building a react router using statecharts concepts*

This project is in its very early stages! Feature requests are definitely welcome.

## Quick Start

Clone the repo to look at the quickstart example. Alternatively:

### Usage

install
```
npm install react-fsm-router
```

import the component:
```js
import Router from 'react-fsm-router';
```

Wrap your application code inside the `Router`.
You must give the router an `fsm` (finite state machine) and set of `transitions` (see below)
```jsx
<Router
    fsm={fsm}
    transitions={transitions}
    fallback={<div>loading</div>}
    >
    <Frame/>
</Router>
```

These components (only at the top level) will be passed a prop `router` (see full API definition below). Trigger a transition by calling `router.TRANSITION`.
```jsx
<Button onClick={() => this.props.router.TRANSITION('TOGGLE')}
```

You can access the current route (i.e. to render different pages) via `router.getRoute()`
```jsx
let route = router.getRoute();
return route[0] === 'view' ? <View/> : <Edit/>
```

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

## Router API

The component `Router` will pass an object `router` to its direct children, with the following methods:
* `TRANSITION` triggers a transition arguments `(args, callback)`
* `getRoute` returns an array of strings representing the route (e.g. `['section1','part1']`)
* `getHistory` returns an array of arrays, where each array represents a route the user has gone to
* `clearHistory` clears the history
* `getQueryMap` returns the query map (e.g. `{id:'123'}`)
* `clearQueryMap` clears the query map
* `setQueryMap` sets the query map (as a delta) - if you want to explicitly clear it you can give it `{key:undefined}`

All the setters and clearers take a final argument as a callback if you need to confirm the state change has occurred before continuing.

## Behaviour

If you use the baseURL of your application, the router will redirect to the URL of your initial state.
If you use a specific URL which maps to a particular state, the router will call the transitions required to get from the initial state to that state, in order, asynchronously. Note that args will be undefined. It will also auto-complete the initial state (e.g. `/section1` in the example will redirect to `/section1/part1`).
The querystring at the end of the URL will be maintained unless you explicitly clear it using `clearQueryMap`.