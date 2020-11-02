import React, { Component, useState } from 'react';
import { Collapse, Container, Navbar, NavbarBrand, NavbarToggler, NavItem } from 'reactstrap';
import { Link } from 'react-router-dom';
import './NavMenu.css';
import { Menu, Input } from 'semantic-ui-react'
import { NavLink, withRouter } from 'react-router-dom'

export const NavMenu = () => {
  const [activeItem, setActiveItem] = useState("home");

  const handleItemClick = (e, { name }) => {
    setActiveItem(name);
  }

  return (
    <header>
      <Menu>
        <Menu.Item
          header
          as={NavLink} to="/"
          onClick={handleItemClick}
        >House of Things</Menu.Item>
        <Menu.Item
          as={NavLink} to="/"
          active={activeItem === 'home'}
          onClick={handleItemClick}
        >Home</Menu.Item>
        <Menu.Item 
          as={NavLink} to="/counter"
          active={activeItem === 'counter'}
          onClick={handleItemClick}
        >Counter</Menu.Item>
        <Menu.Item
          as={NavLink} to="/fetch-data"
          active={activeItem === 'fetch-data'}
          onClick={handleItemClick}
        >Fetch data</Menu.Item>
      </Menu>
    </header>
  );
}
