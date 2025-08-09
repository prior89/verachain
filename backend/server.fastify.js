const fastify = require('fastify')({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV === 'development'
  },
  trustProxy: true,
  bodyLimit: 10485760 // 10MB
});

const path = require('path');
require('dotenv').config();

// Database connection
const connectDB = require('./src/config/database');

// Fastify plugins
const cors = require('@fastify/cors');
const helmet = require('@fastify/helmet');
const rateLimit = require('@fastify/rate-limit');
const jwt = require('@fastify/jwt');
const websocket = require('@fastify/websocket');

// Initialize services
const initServices = async () => {
  // Connect to MongoDB
  await connectDB();
  
  // Initialize Redis
  const redisService = require('./src/services/redis.service');
  await redisService.initialize();
  
  // Initialize job queues
  const queueService = require('./src/services/queue.service');
  await queueService.initialize();
};

// Register plugins
const registerPlugins = async () => {
  // CORS
  await fastify.register(cors, {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || true,
    credentials: true
  });

  // Security headers
  await fastify.register(helmet, {
    contentSecurityPolicy: false // Configure based on your needs
  });

  // Rate limiting
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // JWT authentication
  await fastify.register(jwt, {
    secret: process.env.JWT_SECRET || 'your-secret-key'
  });

  // WebSocket support
  await fastify.register(websocket, {
    options: {
      maxPayload: 1048576 // 1MB
    }
  });
};

// Authentication decorator
fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Performance monitoring
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { MeterProvider } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');

const setupMonitoring = () => {
  const resource = Resource.default().merge(
    new Resource({
      'service.name': 'verachain-backend',
      'service.version': '2.0.0',
    })
  );

  const meterProvider = new MeterProvider({
    resource,
    readers: [
      new PrometheusExporter({
        port: 9090,
      }),
    ],
  });

  global.meter = meterProvider.getMeter('verachain-backend');
};

// Routes
const setupRoutes = () => {
  // Health check
  fastify.get('/health', async (request, reply) => {
    const health = {
      status: 'OK',
      timestamp: new Date(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    };
    
    return health;
  });

  // Metrics endpoint
  fastify.get('/metrics', async (request, reply) => {
    reply.type('text/plain');
    const metrics = await require('prom-client').register.metrics();
    return metrics;
  });

  // API routes
  fastify.register(require('./src/routes/fastify/auth.routes'), { prefix: '/api/auth' });
  fastify.register(require('./src/routes/fastify/product.routes'), { prefix: '/api/products' });
  fastify.register(require('./src/routes/fastify/certificate.routes'), { prefix: '/api/certificates' });
  fastify.register(require('./src/routes/fastify/nft.routes'), { prefix: '/api/nft' });
  fastify.register(require('./src/routes/fastify/verification.routes'), { prefix: '/api/verification' });
  
  // GraphQL endpoint
  fastify.register(require('./src/graphql/fastify-apollo'), { prefix: '/graphql' });
  
  // WebSocket routes
  fastify.register(require('./src/websocket/routes'), { prefix: '/ws' });
};

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  
  if (error.validation) {
    reply.status(400).send({
      success: false,
      message: 'Validation error',
      errors: error.validation
    });
  } else if (error.statusCode) {
    reply.status(error.statusCode).send({
      success: false,
      message: error.message
    });
  } else {
    reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info('Starting graceful shutdown...');
  
  try {
    await fastify.close();
    
    // Close database connections
    const mongoose = require('mongoose');
    await mongoose.connection.close();
    
    // Close Redis connections
    const redisService = require('./src/services/redis.service');
    await redisService.close();
    
    // Close job queues
    const queueService = require('./src/services/queue.service');
    await queueService.close();
    
    fastify.log.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    fastify.log.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const start = async () => {
  try {
    // Initialize services
    await initServices();
    
    // Register plugins
    await registerPlugins();
    
    // Setup monitoring
    setupMonitoring();
    
    // Setup routes
    setupRoutes();
    
    // Start listening
    const PORT = process.env.PORT || 5001;
    const HOST = process.env.HOST || '0.0.0.0';
    
    await fastify.listen({ port: PORT, host: HOST });
    
    fastify.log.info(`🚀 Fastify server running on http://${HOST}:${PORT}`);
    fastify.log.info(`📊 Metrics available at http://${HOST}:9090/metrics`);
    fastify.log.info(`🎯 GraphQL endpoint at http://${HOST}:${PORT}/graphql`);
    fastify.log.info(`🔌 WebSocket endpoint at ws://${HOST}:${PORT}/ws`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Start the server
start();

module.exports = fastify;