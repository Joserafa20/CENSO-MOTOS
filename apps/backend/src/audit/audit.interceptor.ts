import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const action = `${method} ${url}`;

          this.auditService.logAction({
            userId: user?.id,
            action,
            entity: this.extractEntity(url),
            entityId: this.extractEntityId(url),
            description: `Duration: ${duration}ms | Body: ${JSON.stringify(body || {}).slice(0, 500)}`,
            ip,
            userAgent,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const action = `${method} ${url} [ERROR: ${error.message}]`;

          this.auditService.logAction({
            userId: user?.id,
            action,
            entity: this.extractEntity(url),
            entityId: this.extractEntityId(url),
            description: `Duration: ${duration}ms | Error: ${error.message}`,
            ip,
            userAgent,
          });
        },
      }),
    );
  }

  private extractEntity(url: string): string {
    const segments = url.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[0] === 'api') {
      return segments[1];
    }
    return segments[0] || 'unknown';
  }

  private extractEntityId(url: string): string | null {
    const segments = url.split('/').filter(Boolean);
    if (segments.length >= 4 && segments[0] === 'api') {
      const idCandidate = segments[3];
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(idCandidate)) {
        return idCandidate;
      }
    }
    return null;
  }
}
