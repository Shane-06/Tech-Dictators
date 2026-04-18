// Index file - exports the router for this domain
const deliveryRoutes = require('./routes/deliveryRoutes');

module.exports = {
  router: deliveryRoutes,
  path: '/deliveries'
};