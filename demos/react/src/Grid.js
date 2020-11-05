import React from 'react';


export default class Grid extends React.Component {
    constructor() {
        super();
        this.id=("fathGrid"+(Math.random()*1000|0));
    }

    componentDidMount() {
        this.api=window.FathGrid(
            this.id,
            {
                ...this.props
            }
        );
    }
    
    componentWillUnmount() {
        if(this.api!==undefined) this.api.destroy();
    }
    
    componentWillReceiveProps(nextProps) {
        this.api.setConfig(nextProps);
    }

    render() {
        return <table ref={el => this.el = el} id={this.id} />;
    }

}