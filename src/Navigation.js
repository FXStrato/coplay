import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Navigation extends Component {

  componentWillMount = () => {
    document.addEventListener('DOMContentLoaded', function () {

      // Get all "navbar-burger" elements
      var $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll('.navbar-burger'), 0);

      // Check if there are any navbar burgers
      if ($navbarBurgers.length > 0) {

        // Add a click event on each of them
        $navbarBurgers.forEach(function ($el) {
          $el.addEventListener('click', function () {

            // Get the target from the "data-target" attribute
            var target = $el.dataset.target;
            var $target = document.getElementById(target);

            // Toggle the class on both the "navbar-burger" and the "navbar-menu"
            $el.classList.toggle('is-active');
            $target.classList.toggle('is-active');

          });
        });
      }
    });
  }

  render() {
    return (
      <nav className="navbar is-dark is-fixed-top">
        <div className="navbar-brand">
          <div className="navbar-item is-size-5">CoPlay</div>
          <div className="navbar-burger burger" data-target="mobileMenu">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      <div id="mobileMenu" className="navbar-menu">
        <div className="navbar-start">
          <Link to="/" className="navbar-item">Home</Link>
          <Link to="/about" className="navbar-item">About</Link>
          <Link to="/list" className="navbar-item">Room List</Link>
        </div>
        <div className="navbar-end">
          <div className="navbar-item">
            <div className="field is-grouped">

            </div>
          </div>
        </div>
      </div>
    </nav>
    );
  }
}

export default Navigation;
