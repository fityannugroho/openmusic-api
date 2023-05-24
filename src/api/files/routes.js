const path = require('path');

const routes = () => [
  {
    method: 'GET',
    path: '/files/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, '../../storage'),
      },
    },
  },
];

module.exports = routes;
