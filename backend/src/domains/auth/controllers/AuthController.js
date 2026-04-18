const AuthService = require('../services/AuthService');
const { registerSchema, loginSchema } = require('../validation/authValidation');

class AuthController {

  static async register(req, res, next) {
    try {
      const { error } = registerSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const user = await AuthService.register(req.body);
      res.status(201).json({ message: 'User registered', user });
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) return res.status(400).json({ error: error.details[0].message });

      const { email, password } = req.body;
      const user = await AuthService.login(email, password);
      res.json({ message: 'Login successful', user });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;