import React, { useCallback } from 'react';
import "../styles/App.css";
import { ComponentNames, NavButtonProps } from "../types";
import store from "../Store";

const NavButton: React.FC<NavButtonProps> = ({ btnText, screenToOpen, isBackButton, onPress }) => {
  const handleClick = useCallback(() => {
    store.setCurrentPage(screenToOpen);
    onPress && onPress();
  }, []);

  const classNames = `btn${isBackButton ? " backButton" : ""}`
  // console.log({ isBackButton })

  return (
    <div className={classNames} onClick={handleClick}>
      {btnText}
    </div>
  )
}
export default NavButton;