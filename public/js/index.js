/* eslint-disable */

import '@babel/polyfill';
import { login, logout, signup } from './account';
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const signupForm = document.querySelector('.form--signup');
const loginForm = document.querySelector('.form--login');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const logoutButton = document.querySelector('.nav__el--logout');
const bookButton = document.getElementById('book-tour');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (logoutButton)
  logoutButton.addEventListener('click', event => {
    event.preventDefault();

    logout();
  });

if (signupForm)
  signupForm.addEventListener('submit', async event => {
    event.preventDefault();

    document.querySelector('.btn--signup').textContent = 'Registering...';

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await signup({ name, email, password, passwordConfirm });
    document.querySelector('.btn--signup').textContent = 'Register';
  });

if (loginForm)
  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    document.querySelector('.btn--login').textContent = 'Logging In...';

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    await login(email, password);
    document.querySelector('.btn--login').textContent = 'Log In';
  });

if (userDataForm)
  userDataForm.addEventListener('submit', async event => {
    document.querySelector('.btn--save-data').textContent = 'Saving...';
    event.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    await updateSettings(form, 'data');
    document.querySelector('.btn--save-data').textContent = 'Save Settings';
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async event => {
    event.preventDefault();

    document.querySelector('.btn--save-password').textContent = 'Saving...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookButton)
  bookButton.addEventListener('click', async event => {
    event.target.textContent = 'Processing...';

    const { tourId } = event.target.dataset;

    bookTour(tourId);
  });
