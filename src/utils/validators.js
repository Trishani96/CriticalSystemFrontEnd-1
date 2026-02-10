/**
 * Form Validators
 */

export const validators = {
  email: (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password) => {
    return password && password.length >= 8;
  },

  username: (username) => {
    const regex = /^[a-zA-Z0-9_]{3,50}$/;
    return regex.test(username);
  },

  amount: (amount) => {
    const num = parseFloat(amount);
    return !isNaN(num) && num > 0;
  }
};
