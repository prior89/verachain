const winston = require('winston');
const Sentry = require('@sentry/node');
const client = require('prom-client');

class MonitoringService {
  constructor() {
    this.logger = null;
    this.metrics = {};
    this.register = new client.Registry();
  }

  /**
   * Initialize monitoring services
   */
  initialize() {
    // Initialize logger
    this.initializeLogger();
    
    // Initialize Sentry for error tracking
    this.initializeSentry();
    
    // Initialize Prometheus metrics
    this.initializeMetrics();
    
    console.log('✅ Monitoring service initialized');
  }

  /**
   * Initialize Winston logger
   */
  initializeLogger() {
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    );

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: logFormat,
      defaultMeta: { service: 'verachain-backend' },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for errors
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // Handle uncaught exceptions
    this.logger.exceptions.handle(
      new winston.transports.File({ filename: 'logs/exceptions.log' })
    );

    // Handle unhandled rejections
    this.logger.rejections.handle(
      new winston.transports.File({ filename: 'logs/rejections.log' })
    );
  }

  /**
   * Initialize Sentry for error tracking
   */
  initializeSentry() {
    if (process.env.SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        integrations: [
          new Sentry.Integrations.Http({ tracing: true }),
          new Sentry.Integrations.Express({ app: require('express')() }),
        ],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
      });
      
      console.log('Sentry initialized');
    }
  }

  /**
   * Initialize Prometheus metrics
   */
  initializeMetrics() {
    // Default metrics
    client.collectDefaultMetrics({ register: this.register });

    // HTTP request duration
    this.metrics.httpRequestDuration = new client.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    // HTTP request count
    this.metrics.httpRequestCount = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status']
    });

    // Active connections
    this.metrics.activeConnections = new client.Gauge({
      name: 'active_connections',
      help: 'Number of active connections'
    });

    // Database query duration
    this.metrics.dbQueryDuration = new client.Histogram({
      name: 'db_query_duration_seconds',
      help: 'Duration of database queries in seconds',
      labelNames: ['operation', 'collection'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5]
    });

    // Cache hit rate
    this.metrics.cacheHitRate = new client.Gauge({
      name: 'cache_hit_rate',
      help: 'Cache hit rate percentage'
    });

    // Queue metrics
    this.metrics.queueJobsProcessed = new client.Counter({
      name: 'queue_jobs_processed_total',
      help: 'Total number of queue jobs processed',
      labelNames: ['queue', 'status']
    });

    this.metrics.queueJobDuration = new client.Histogram({
      name: 'queue_job_duration_seconds',
      help: 'Duration of queue job processing',
      labelNames: ['queue'],
      buckets: [0.5, 1, 5, 10, 30, 60, 120]
    });

    // Business metrics
    this.metrics.userRegistrations = new client.Counter({
      name: 'user_registrations_total',
      help: 'Total number of user registrations'
    });

    this.metrics.productVerifications = new client.Counter({
      name: 'product_verifications_total',
      help: 'Total number of product verifications',
      labelNames: ['status']
    });

    this.metrics.nftMinted = new client.Counter({
      name: 'nft_minted_total',
      help: 'Total number of NFTs minted'
    });

    this.metrics.revenue = new client.Gauge({
      name: 'revenue_total',
      help: 'Total revenue',
      labelNames: ['currency']
    });

    // Register all metrics
    Object.values(this.metrics).forEach(metric => {
      this.register.registerMetric(metric);
    });
  }

  /**
   * Log methods
   */
  
  log(level, message, meta = {}) {
    if (this.logger) {
      this.logger.log(level, message, meta);
    }
  }

  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  error(message, error = null, meta = {}) {
    const errorMeta = error ? {
      error: {
        message: error.message,
        stack: error.stack,
        ...error
      },
      ...meta
    } : meta;
    
    this.log('error', message, errorMeta);
    
    // Send to Sentry
    if (error && Sentry.getCurrentHub().getClient()) {
      Sentry.captureException(error);
    }
  }

  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Metric tracking methods
   */
  
  trackHttpRequest(method, route, status, duration) {
    this.metrics.httpRequestDuration.observe(
      { method, route, status: status.toString() },
      duration
    );
    this.metrics.httpRequestCount.inc({ method, route, status: status.toString() });
  }

  trackDbQuery(operation, collection, duration) {
    this.metrics.dbQueryDuration.observe({ operation, collection }, duration);
  }

  trackCacheHit(hit) {
    // Update cache hit rate (implement actual calculation)
    const currentRate = this.metrics.cacheHitRate.get() || 0;
    const newRate = hit ? Math.min(100, currentRate + 1) : Math.max(0, currentRate - 1);
    this.metrics.cacheHitRate.set(newRate);
  }

  trackQueueJob(queue, status, duration) {
    this.metrics.queueJobsProcessed.inc({ queue, status });
    if (duration) {
      this.metrics.queueJobDuration.observe({ queue }, duration);
    }
  }

  trackUserRegistration() {
    this.metrics.userRegistrations.inc();
  }

  trackProductVerification(status) {
    this.metrics.productVerifications.inc({ status });
  }

  trackNFTMinted() {
    this.metrics.nftMinted.inc();
  }

  trackRevenue(amount, currency = 'USD') {
    this.metrics.revenue.inc({ currency }, amount);
  }

  updateActiveConnections(count) {
    this.metrics.activeConnections.set(count);
  }

  /**
   * Get metrics for export
   */
  async getMetrics() {
    return await this.register.metrics();
  }

  /**
   * Health check
   */
  async healthCheck() {
    const checks = {
      logger: !!this.logger,
      sentry: !!Sentry.getCurrentHub().getClient(),
      metrics: Object.keys(this.metrics).length > 0
    };

    const healthy = Object.values(checks).every(check => check === true);

    return {
      healthy,
      checks,
      timestamp: new Date()
    };
  }

  /**
   * Performance profiling
   */
  startTimer(label) {
    return {
      label,
      start: process.hrtime.bigint()
    };
  }

  endTimer(timer) {
    const end = process.hrtime.bigint();
    const duration = Number(end - timer.start) / 1000000; // Convert to milliseconds
    
    this.debug(`Timer ${timer.label}: ${duration}ms`);
    
    return duration;
  }

  /**
   * Express middleware
   */
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Track response
      res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        const route = req.route ? req.route.path : req.path;
        
        this.trackHttpRequest(req.method, route, res.statusCode, duration);
        
        // Log request
        this.info('HTTP Request', {
          method: req.method,
          url: req.url,
          status: res.statusCode,
          duration: `${duration}s`,
          ip: req.ip,
          userAgent: req.get('user-agent')
        });
      });
      
      next();
    };
  }

  /**
   * Error middleware
   */
  errorMiddleware() {
    return (err, req, res, next) => {
      this.error('Request error', err, {
        method: req.method,
        url: req.url,
        ip: req.ip
      });
      
      next(err);
    };
  }
}

module.exports = new MonitoringService();