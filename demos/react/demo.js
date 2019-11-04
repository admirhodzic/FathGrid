import React from 'react';
import FathGrid from './fathgrid';


export default class GridDemo extends React.Component { 
    componentDidMount() {
      
        this.t1=FathGrid(this.props.id,{
            size:this.props.size||10,
            columns:this.props.columns,
            data:this.props.data,
        });
    }  
    componentWillUnmount(){
    }
    shouldComponentUpdate() {
        return false;
    }
    render() {
        return (
            <div>
                <table id={this.props.id} className="table table-hover table-bordered "><thead className="thead-light"></thead></table>
            </div>
        );
    }
}
