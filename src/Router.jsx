import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as H from './helpers';
import parsePath from 'parse-path';

class Router extends Component {
    constructor(props) {
        super(props);

        this.state = {
            initialised:false
        };

        this.transition = this.transition.bind(this);

        this.getRoute = this.getRoute.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.clearHistory = this.clearHistory.bind(this);
        this.getQueryMap = this.getQueryMap.bind(this);
        this.clearQueryMap = this.clearQueryMap.bind(this);
        this.setQueryMap = this.setQueryMap.bind(this);
        this.getRouterFns = this.getRouterFns.bind(this);
    }

    componentDidMount() {
        console.log('component did mount');
        const {fsm, transitions} = this.props;

        let initialRoute = H.getInitialRoute(fsm);
        let parsedURL = parsePath(window.location.href);
        let baseURL = H.getBaseURL(parsedURL.href);

        let initialState = {
            route: initialRoute,
            history: [],
            queryMap: parsedURL.query,
            baseURL         
        };

        let parsedPath = parsedURL.pathname.split('/');
        // remove initial /
        parsedPath.splice(0, 1);

        // for each argument in the path, if it doesnt match the initial state, trigger a transition. always give the transition the full router in case its useful
        if (parsedPath.length>0) {
            initialRoute = parsedPath;
            initialState.route = H.getFullInitialRoute(fsm, initialRoute);
        }
        console.log('setting initial state');

        // set initial state, and then walk the state tree to trigger required transitions
        this.setState(initialState,() => {
            console.log('in set initial state callback');

            if(parsedPath.length>0){
                console.log('theres a parsed path so were walking the state tree');

                H.walkStateTree(parsedPath, fsm, transitions, this.getRouterFns(), () => {
                    console.log('finished walking the state tree');
                    if ('pushState' in window.history) {
                        let subURL = initialState.route.join('/');
                        let queryString = parsedURL.search ? `?${parsedURL.search}` : '';
                        let newURL = `${baseURL}/${subURL}${queryString}`;
                        window.history.pushState({}, '', newURL);
                    }
                    this.setState({initialised:true});
                });
            }
            else{
                console.log('setting initialised to true as no parsedPath');

                this.setState({initialised:true});
            }
        });        
    }

    transition(transitionKey, args, cb) {
        // the premise here is - complete the transition (which is likely to call methods on this object like this.setQueryMap) and then update state

        this.props.transitions[transitionKey](
            { router: this.getRouterFns(), args },
            () => {
                let newRoute = H.getNewRoute(
                    transitionKey,
                    this.state.route,
                    this.props.fsm
                );

                this.setState({
                    history:[this.state.route, ...this.state.history],
                    route:newRoute

                })
                // update the url
                if ('pushState' in window.history) {
                    let newURL = this.state.baseURL;
                    if (newRoute.length > 0) {
                        let route = newRoute.join('/');
                        newURL = `${newURL}/${route}`;
                    }
                    if (
                        this.state.queryMap &&
                        Object.keys(this.state.queryMap).length > 0
                    ) {
                        let queryString = H.stringifyQueryMap(
                            this.state.queryMap
                        );
                        newURL = `${newURL}?${queryString}`;
                    }

                    window.history.pushState({}, '', newURL);
                }
                // only call the callback if its actually there
                if(cb){
                    cb();
                }
            }
        );
    }
    getRoute() {
        return this.state.route;
    }
    getHistory() {
        return this.state.history;
    }
    clearHistory(cb) {
        this.setState({history:[]},cb)
        return;
    }
    getQueryMap() {
        return this.state.queryMap;
    }
    clearQueryMap(cb) {
        this.setState({queryMap:{}},cb);
    }
    setQueryMap(delta,cb) {
        let newMap =  Object.assign({}, this.state.queryMap, delta);
        this.setState({queryMap:newMap},cb);
    }

    getRouterFns(){
        return {
            getRoute:this.getRoute,
            getHistory:this.getHistory,
            clearHistory:this.clearHistory,
            getQueryMap:this.getQueryMap,
            clearQueryMap:this.clearQueryMap,
            setQueryMap:this.setQueryMap,
            TRANSITION:this.transition
        }
    }

    render() {
        if(this.state.initialised){

            const children = React.Children.map(this.props.children, child => {
                return React.cloneElement(child, {
                    router:this.getRouterFns()}
                );
            });
            return <div>
                {children}
            </div>
        }
        else if(!this.props.fallback){
            throw 'Error: no fallback specified for react-fsm-router Router'
        }
        else{
            return this.props.fallback;
        }  
    }
}


Router.propTypes = {
    children: PropTypes.any,
    fsm: PropTypes.any,
    transitions: PropTypes.any,
    fallback:PropTypes.element
};
export default Router;
