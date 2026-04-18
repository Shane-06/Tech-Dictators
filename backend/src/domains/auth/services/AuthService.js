const User = require('../models/User');

// Auth Service Layer
class AuthService {
  
  static async register(userData) {
    try {
      const { email, password, name } = userData;
      
      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('Email already registered');
      
      // Create user (in production, hash password with bcrypt)
      const user = new User({ email, password, name });
      await user.save();
      
      return { id: user._id, email: user.email, name: user.name };
    } catch (err) {
      throw new Error(`Registration failed: ${err.message}`);
    }
  }

  static async login(email, password) {
    try {
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');
      
      // In production, use bcrypt.compare()
      if (user.password !== password) throw new Error('Invalid credentials');
      
      return { id: user._id, email: user.email, name: user.name, role: user.role };
    } catch (err) {
      throw new Error(`Login failed: ${err.message}`);
    }
  }
}

module.exports = AuthService;