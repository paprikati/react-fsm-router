import React from 'react';
import Section1 from './sections/section1';

function App() {
  console.log('rendering');
  console.log(window.location.href);
  return (
    <div className="App">
      <button>Toggle</button>
      <Section1/>
    </div>
  );
}

export default App;
