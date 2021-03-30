import React from 'react';
const FathGrid=require( './dist/FathGrid.js');

export default class FathGridComponent extends React.Component {
    constructor() {
        super();
        this.id=("fathGrid"+(Math.random()*1000|0));
        this.state={};
    }

    componentDidMount() {
        this.setState({api:FathGrid(
            this.id,
            {
                ...this.props
            }
        )});
    }
    
    componentWillUnmount() {
        if(this.state.api!==undefined) this.state.api.destroy();
    }
    static getDerivedStateFromProps(props, state) {
        if(undefined!==state.api) state.api.setConfig(props);
        return state;
    }

    render() {
        return <table ref={el => this.el = el} id={this.id} />;
    }

}