import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    // Check if it's a GraphQL request
    const gqlContext = GqlExecutionContext.create(context);
    const isGraphQL = gqlContext.getType() === 'graphql';

    if (isGraphQL) {
      return this.handleGraphQLRequest(gqlContext, next, start);
    } else {
      return this.handleHttpRequest(context, next, start);
    }
  }

  private handleHttpRequest(
    context: ExecutionContext,
    next: CallHandler,
    start: number,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        const { method, route } = request;
        const { statusCode } = response;

        this.metricsService.incrementHttpRequests(
          method,
          route?.path || 'unknown',
          statusCode,
        );
        this.metricsService.observeHttpDuration(
          method,
          route?.path || 'unknown',
          duration,
        );
      }),
    );
  }

  private handleGraphQLRequest(
    gqlContext: GqlExecutionContext,
    next: CallHandler,
    start: number,
  ): Observable<any> {
    const info = gqlContext.getInfo();
    const operationName =
      info?.operation?.name?.value || info?.fieldName || 'unknown';
    const operationType = info?.operation?.operation || 'unknown';

    this.metricsService.incrementGraphQLRequests(operationName, operationType);

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        this.metricsService.observeGraphQLDuration(
          operationName,
          operationType,
          duration,
        );
      }),
    );
  }
}
