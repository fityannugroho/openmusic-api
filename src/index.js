require('dotenv').config();

const Hapi = require('@hapi/hapi');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  // TODO: Register the plugins
  // ...

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
