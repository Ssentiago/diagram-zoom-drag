import { NavLink } from 'react-router-dom';
import React from 'react';
import { NavbarContainer, NavbarTab, NavbarTabs } from './Navbar.styled';
import { Platform } from 'obsidian';

/**
 * A simple navigation bar component.
 *
 * This component renders a horizontal navigation bar with three
 * links: one to the diagram section, one to the panel section, and
 * one to the about page. The links are styled as tabs and are
 * responsive to the active route.
 *
 * @returns The rendered navigation bar element.
 */
const Navbar: React.FC = () => (
    <NavbarContainer>
        <NavbarTabs>
            <NavbarTab as={NavLink} to={'/diagram-section'} draggable={false}>
                Diagram
            </NavbarTab>
            <NavbarTab as={NavLink} to={'/panel-section'} draggable={false}>
                Panel
            </NavbarTab>
            <NavbarTab as={NavLink} to={'/Debug/'} draggable={false}>
                Debug
            </NavbarTab>
            <NavbarTab as={NavLink} to={'/about'} draggable={false}>
                About
            </NavbarTab>
        </NavbarTabs>
    </NavbarContainer>
);

export default Navbar;
