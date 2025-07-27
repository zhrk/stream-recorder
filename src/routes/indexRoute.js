const layout = require('./layout');

const indexRoute = (c) => c.html(layout({ children: null }));

module.exports = indexRoute;
