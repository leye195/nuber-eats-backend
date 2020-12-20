import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import {
  CreateAccountInPut,
  CreateAccountOutPut,
} from './dtos/createAccount.dto';
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
      const error = await this.userService.createAccount(createAccountInput);
      if (error) {
        return {
          ok: false,
          error,
        };
      }
      return { ok: true, error: '' };
    } catch (e) {
      console.log(e);
      return { ok: false, error: e };
    }
  }
}
