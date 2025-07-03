import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const lang = request.headers['lang'] || 'en';
    return next.handle().pipe(
      map((data) => this.transformResponse(data, lang)),
    );
  }

  private transformResponse(data: any, lang: string): any {
    if (Array.isArray(data)) {
      return data.map((item) => this.transformResponse(item, lang));
    } else if (data && typeof data === 'object') {
      const transformed = { ...data };
      for (const key of Object.keys(transformed)) {
        if (lang === 'ar' && transformed.hasOwnProperty(key + 'Ar')) {
          transformed[key] = transformed[key + 'Ar'];
        }
        if (typeof transformed[key] === 'object') {
          transformed[key] = this.transformResponse(transformed[key], lang);
        }
      }
      return transformed;
    }
    return data;
  }
}
