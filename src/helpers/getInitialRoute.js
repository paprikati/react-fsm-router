export default function getInitialRoute(sm, current = []) {
    if (!sm.initial) {
        return current;
    }
    current.push(sm.initial);
    if (sm.states[sm.initial].states) {
        current = [...current, ...getInitialRoute(sm.states[sm.initial])];
    }
    return current;
}