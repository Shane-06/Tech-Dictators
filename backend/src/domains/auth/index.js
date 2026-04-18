// Index file - exports the router for this domain
const authRoutes = require('./routes/authRoutes');

module.exports = {
  router: authRoutes,
  path: '/auth'
};