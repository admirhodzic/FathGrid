import React from 'react';
import GridDemo from './demo';

import './App.css';

function App() {
  return (
    <div className="App">
      <GridDemo id="t12" 
        columns={[{name:0,header:'Name'},{name:1,header:'Value'}]} 
        data={[['a','b'],['c','d']]}
      />
    </div>
  );
}

export default App;
