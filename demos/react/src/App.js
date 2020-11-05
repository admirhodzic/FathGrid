import './App.css';
import Grid from './Grid.js';
import { useRef, useState } from 'react';

function App() {
  const grid=useRef();
  const [pageSize, setSize] = useState(5);
  return (
    <div className="App">
          Select page size: <select 
            onChange={(e)=>{
              setSize(e.target.value)
              }} >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
          </select>

          <Grid ref={grid}
            serverURL={'https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${size}&_sort=${sort}&_order=${order}&q=${search}&${filters}'}
            
            size={pageSize}
            
            inputClass='form-control'
            
            tableClass='table table-bordered'

            onClick={(data,col,el)=>{console.log(data,col,el);}}

            columns={[
              {name:'id',header:'ID'},
              {name:'title',header:'Title'},
              {name:'body',header:'Body'},
            ]}/>
    </div>
  );
}

export default App;
