const { registerService, loginService } = require("../service/auth");

const registerController = async (req, res) => {
  const { name, email, password, bio, photo_url } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Invalid Data" });
  }

  try {
    const result = await registerService({
      name,
      email,
      password,
      bio,
      photo_url,
    });
    return res.status(201).json(result); // result is { message: "User registered successfully" }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await loginService({ email, password });
    return res.status(200).json({ message: "Login Successful", ...result }); // result is { token, user }
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
};

module.exports = { loginController, registerController };
