require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const albums = require('./api/albums');
const songs = require('./api/songs');
const ClientError = require('./exceptions/ClientError');
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');
const AuthService = require('./services/postgres/AuthService');
const auth = require('./api/auth');
const AuthValidator = require('./validator/auth');
const TokenManager = require('./tokenize/TokenManager');
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

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

  // Register external plugins
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Define jwt authentication strategy.
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  const songsService = new SongsService();
  const albumsService = new AlbumsService(songsService);
  const usersService = new UsersService();
  const authService = new AuthService();
  const playlistsService = new PlaylistsService();

  // Register the plugins
  await server.register([
    // Albums plugin
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    // Songs plugin
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    // Users plugin
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    // Auth plugin
    {
      plugin: auth,
      options: {
        authService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthValidator,
      },
    },
    // Playlists plugin
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    // Handle the client error
    if (response instanceof ClientError) {
      return h.response({
        status: 'fail',
        message: response.message,
      }).code(response.statusCode);
    }

    // Handle the server error
    if (response.isServer) {
      console.error(`${response.name}: ${response.message}\n${response.stack}\n`);
      return h.response({
        status: 'error',
        message: 'Something went wrong in our server.',
      }).code(500);
    }

    return h.continue;
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
