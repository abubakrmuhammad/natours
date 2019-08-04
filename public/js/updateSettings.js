/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export async function updateSettings(data, type) {
  try {
    const endpoint = type === 'password' ? 'updateMyPassword' : 'me';
    const response = await axios({
      method: 'PATCH',
      url: `/api/v1/users/${endpoint}`,
      data
    });

    if (response.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} Updated Successfully!`);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}
