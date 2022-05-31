import React from 'react';
type SwitchProps = {
  active: string,
  children: JSX.Element[],
}

const Switch: React.FC<SwitchProps> = ({ active, children }) => {
  return <>
    {children?.filter(child => child.props.name === active)}
  </>
}
export default Switch;