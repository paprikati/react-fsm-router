import getInitialRoute from './getInitialRoute';

export default function getNewRoute(transitionKey, currentStatePath, configFSM) {
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
