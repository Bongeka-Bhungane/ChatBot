import { useState } from 'react'


import './App.css'
import StatCard from './components/starCard';

function App() {
 

  return (
    <>
      <StatCard name="Total Users" value={128} />
      <StatCard name="Active Sessions" value={34} />
      <StatCard name="Revenue" value="$4,200" />
    </>
  );
}

export default App
