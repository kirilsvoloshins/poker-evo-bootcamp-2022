import React from 'react';
import { ComponentNames } from '../types';

const Credits: React.FC<{ name: ComponentNames }> = () => {
  return (
    <div className="creditsDiv">
      made by Kirils Vološins
      <br />
      during the Evolution 2022 Typescript React bootcamp
    </div>
  )
};
export default Credits;