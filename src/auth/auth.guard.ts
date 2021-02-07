import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AllowedRoles } from './role.decorator';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflactor: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflactor.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );

    if (!roles) {
      return true;
    }

    //convert context to gqlContext
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    if (!user) return false;

    return roles.includes(user.role) || roles.includes('Any');
  }
}
