// Check email pattern
export const isEmail = (email) => {
  var pattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  return pattern.test(email);
};
