import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInPut,
  CreateAccountOutPut,
} from './dtos/createAccount.dto';
import { LoginInput, LoginOutPut } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User) // Resolver of User
export class UsersResolver {
  constructor(private readonly userService: UsersService) {}

  @Query(() => [User])
  users(): [] {
    return [];
  }

  @Mutation(() => CreateAccountOutPut)
  async createAccount(
    @Args('input')
    createAccountInput: CreateAccountInPut,
  ): Promise<CreateAccountOutPut> {
    try {
      return this.userService.createAccount(createAccountInput);
    } catch (e) {
      console.log(e);
      return { ok: false, error: e };
    }
  }

  @Mutation(() => LoginOutPut)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutPut> {
    try {
      return this.userService.login(loginInput);
    } catch (e) {
      console.log(e);
      return { ok: false, error: e };
    }
  }

  @Query(() => User)
  @UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }
}
