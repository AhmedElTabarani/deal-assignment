const swaggerJsdoc = require('swagger-jsdoc');
const swaggerSchemas = require('./swaggerSchemas');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    components: {
      schemas: swaggerSchemas,
    },
    info: {
      title: 'Blog API with Swagger',
      version: '0.1.0',
      description: 'Blog API',
    },
    basePath: '/api',
    tags: [
      {
        name: 'Users',
        description: 'User Operations',
      },
      {
        name: 'Admin',
        description: 'Admin ONLY Operations',
      },
      {
        name: 'Posts',
        description: 'Post Operations',
      },
      {
        name: 'Comments',
        description: 'Comment Operations',
      },
      {
        name: 'Interactions',
        description: 'Interaction Operations',
      },
    ],
  },
  apis: [path.join(__dirname, '../routes/*.js')],
};


module.exports = swaggerJsdoc(options);
