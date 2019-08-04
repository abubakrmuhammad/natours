/* eslint-disable */

export function showAlert(type, message) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
  setTimeout(hideAlert, 5000);
}

export function hideAlert() {
  const element = document.querySelector('.alert');
  if (element) element.parentNode.removeChild(element);
}
