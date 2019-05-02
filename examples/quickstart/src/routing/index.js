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
    TOGGLE: function({ args, router }, cb) {
        console.log('toggling');
        console.log(router);
        if (router) {
            router.clearQueryMap();
        }
        cb();
    },
    CHANGE_PART: function({ args, router }, cb) {
        console.log('changing part');
        cb();
    }
};

module.exports = { fsm, transitions };
