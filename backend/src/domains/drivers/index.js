// Index file - exports the router for this domain
const driverRoutes = require('./routes/driverRoutes');

module.exports = {
  router: driverRoutes,
  path: '/drivers'
};