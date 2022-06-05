import React from 'react';
import { SwitchProps } from '../types';

const Switch: React.FC<SwitchProps> = ({ active, children }) => {
  return <>
    {children?.filter(child => child.props.name === active)}
  </>
}
export default Switch;