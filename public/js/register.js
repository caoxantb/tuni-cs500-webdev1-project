/**
 * TODO: 8.4 Register new user --> DONE
 *       - Handle registration form submission
 *       - Prevent registration when password and passwordConfirmation do not match
 *       - Use createNotification() function from utils.js to show user messages of
 *       - error conditions and successful registration
 *       - Reset the form back to empty after successful registration
 *       - Use postOrPutJSON() function from utils.js to send your data back to server
 */
(() => {
  const [nameInput, password, email, passwordConfirmation, button] = [
    "name",
    "password",
    "email",
    "passwordConfirmation",
    "btnRegister",
  ].map((id) => document.getElementById(id));

  button.addEventListener("click", async (e) => {
    e.preventDefault();
    if (password.value !== passwordConfirmation.value) {
      createNotification(
        "Password and password confirmation do not match",
        "notifications-container",
        false
      );
      return;
    }
    if (password.value.length < 10) {
      createNotification(
        "Password length is less than 10",
        "notifications-container",
        false
      );
      return;
    }
    try {
      await postOrPutJSON("http://localhost:3000/api/register", "POST", {
        name: nameInput.value,
        password: password.value,
        email: email.value,
      });
      createNotification("User created", "notifications-container", true);
      nameInput.value = "";
      password.value = "";
      email.value = "";
      passwordConfirmation.value = "";
    } catch (error) {
      createNotification(
        "Email already exists",
        "notifications-container",
        false
      );
    }
  });
})();