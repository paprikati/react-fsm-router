
import getInitialRoute from './getInitialRoute';

export default function getFullInitialRoute(fsm, initialRoute) {
    let fsmLocation = fsm;
    // get to the right bit of the fsm
    initialRoute.forEach(ea => {
        fsmLocation = fsmLocation.states[ea];
    });
    return [...initialRoute, ...getInitialRoute(fsmLocation)];
}