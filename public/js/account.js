/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export async function signup(data) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/signup',
      data
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Successfully created your account!');

      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export async function login(email, password) {
  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (response.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');

      setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

export async function logout() {
  try {
    const response = await axios({
      method: 'GET',
      url: 'http://localhost:3000/api/v1/users/logout'
    });

    if (response.data.status === 'success') location.reload(true);
  } catch (err) {
    showAlert('error', 'Error Logging out! Please try again.');
  }
}
