import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bus, Briefcase, Home as House, Map as MapIcon } from 'lucide-react';
import styles from './Navbar.module.css';

const Navbar = () => {
    return (
        <nav className={styles.navbar}>
            <NavLink to="/" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>
            <NavLink to="/transport" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                <Bus size={24} />
                <span>Bus/CP</span>
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                <MapIcon size={24} />
                <span>Map</span>
            </NavLink>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                <Briefcase size={24} />
                <span>Jobs</span>
            </NavLink>
            <NavLink to="/housing" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
                <House size={24} />
                <span>Housing</span>
            </NavLink>
        </nav>
    );
};

export default Navbar;
