import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly graphqlRequestsTotal: Counter<string>;
  private readonly graphqlRequestDuration: Histogram<string>;
  private readonly activeUsersGauge: Gauge<string>;
  private readonly activeBetsGauge: Gauge<string>;

  constructor() {
    // HTTP request counter
    this.httpRequestsTotal = new Counter({
      name: 'f1_betting_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    });

    // HTTP request duration
    this.httpRequestDuration = new Histogram({
      name: 'f1_betting_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // GraphQL request counter
    this.graphqlRequestsTotal = new Counter({
      name: 'f1_betting_graphql_requests_total',
      help: 'Total number of GraphQL requests',
      labelNames: ['operation_name', 'operation_type'],
    });

    // GraphQL request duration
    this.graphqlRequestDuration = new Histogram({
      name: 'f1_betting_graphql_request_duration_seconds',
      help: 'Duration of GraphQL requests in seconds',
      labelNames: ['operation_name', 'operation_type'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
    });

    // Business metrics
    this.activeUsersGauge = new Gauge({
      name: 'f1_betting_active_users',
      help: 'Number of currently active users',
    });

    this.activeBetsGauge = new Gauge({
      name: 'f1_betting_active_bets',
      help: 'Number of active bets',
    });

    // Register metrics
    register.registerMetric(this.httpRequestsTotal);
    register.registerMetric(this.httpRequestDuration);
    register.registerMetric(this.graphqlRequestsTotal);
    register.registerMetric(this.graphqlRequestDuration);
    register.registerMetric(this.activeUsersGauge);
    register.registerMetric(this.activeBetsGauge);
  }

  // HTTP metrics
  incrementHttpRequests(method: string, route: string, statusCode: number) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
    });
  }

  observeHttpDuration(method: string, route: string, duration: number) {
    this.httpRequestDuration.observe({ method, route }, duration);
  }

  // GraphQL metrics
  incrementGraphQLRequests(operationName: string, operationType: string) {
    this.graphqlRequestsTotal.inc({
      operation_name: operationName || 'unknown',
      operation_type: operationType || 'unknown',
    });
  }

  observeGraphQLDuration(
    operationName: string,
    operationType: string,
    duration: number,
  ) {
    this.graphqlRequestDuration.observe(
      {
        operation_name: operationName || 'unknown',
        operation_type: operationType || 'unknown',
      },
      duration,
    );
  }

  // Business metrics
  setActiveUsers(count: number) {
    this.activeUsersGauge.set(count);
  }

  setActiveBets(count: number) {
    this.activeBetsGauge.set(count);
  }
}
