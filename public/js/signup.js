// signup.js
// @ts-nocheck
/* eslint-disable */
 
// REGISTER

const signup = async (name, email, password, passwordConfirm) => {
  try {
    const resultSignup = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    });
    if (resultSignup.data.status === 'success') {
      showAlert('success', 'signed up in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
      window.setTimeout(() => {
        location.assign('/');
      }, 1000);
    }
  } catch (err) {
    showAlert('success', 'Signed up successfully!');

  }
};
 
document.querySelector('.form').addEventListener('submit', e => {
  e.preventDefault();
 
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const passwordConfirm = document.getElementById('passwordConfirm').value;
  signup(name, email, password, passwordConfirm);
});
