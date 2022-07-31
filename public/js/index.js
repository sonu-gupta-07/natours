/* eslint-disable */

console.log('im running');
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password
      }
    });

    if (res.data.status === 'success') {
      alert('Logged in successfully!');
      console.log('logged a user in');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert('Invalid Email or Password');
  }
};

document.querySelector('.form--login').addEventListener('submit', e => {
  e.preventDefault();
  console.log('onClick');
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  login(email, password);
});
