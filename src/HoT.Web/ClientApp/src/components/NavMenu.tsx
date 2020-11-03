import React, { useState, MouseEvent } from 'react';
import { Menu, MenuItemProps } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'

export const NavMenu = () => {
  const [activeItem, setActiveItem] = useState<string | undefined>("");

  function handleItemClick(_: MouseEvent, data: MenuItemProps) {
    setActiveItem(data.name);
  }

  return (
    <Menu>
      <Menu.Item
        header
      >House of Things</Menu.Item>
      <Menu.Item
        as={NavLink} name="home" exact to="/"
        active={activeItem === 'home'}
        onClick={handleItemClick}
      >Home</Menu.Item>
      <Menu.Item 
        as={NavLink} name="counter" to="/counter"
        active={activeItem === 'counter'}
        onClick={handleItemClick}
      >Counter</Menu.Item>
      <Menu.Item
        as={NavLink} name="" to="/fetch-data"
        active={activeItem === 'fetch-data'}
        onClick={handleItemClick}
      >Fetch data</Menu.Item>
    </Menu>
  );
}
