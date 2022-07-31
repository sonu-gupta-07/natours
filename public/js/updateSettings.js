/* eslint-disable */

// type is either 'password' or 'data'

const updateData = async (name, email) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/updateMe',
      data: {
        name, 
        email
      }
    });

    if (res.data.status === 'success') {
      alert('success', 'Data updated successfully!');
    }
  } catch (err) {
    alert('error', err.response.data.message);
  }
};

document.querySelector('.form-user-data').addEventListener('submit', e => {
  e.preventDefault();
  console.log('onClick');
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  login(name, email);
});