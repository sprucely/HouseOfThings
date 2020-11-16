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
        as={NavLink} name="locations" exact to="/"
        active={activeItem === 'locations'}
        onClick={handleItemClick}
      >Locations</Menu.Item>
      <Menu.Item 
        as={NavLink} name="things" to="/things"
        active={activeItem === 'things'}
        onClick={handleItemClick}
      >Things</Menu.Item>
    </Menu>
  );
}
