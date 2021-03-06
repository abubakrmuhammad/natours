import axios from 'axios';
import { showAlert } from './alerts';

/* eslint-disable */
const stripe = Stripe('pk_test_sb8AA9PvCMl18KcJE0sUtZzD00J20dHRh4');

export async function bookTour(tourId) {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    showAlert('error', err);
  }
}
