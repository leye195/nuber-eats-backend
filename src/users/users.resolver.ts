import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import {
  CreateAccountInPut,
  CreateAccountOutPut,
} from './dtos/createAccount.dto';
import { DeleteProfileOutput } from './dtos/delete-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutPut } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Resolver(() => User) // Resolver of User
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User])
  users(): [] {
    return [];
  }

  @Mutation(() => CreateAccountOutPut)
  async createAccount(
    @Args('input')
    createAccountInput: CreateAccountInPut,
  ): Promise<CreateAccountOutPut> {
    return this.usersService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutPut)
  async login(@Args('input') loginInput: LoginInput): Promise<LoginOutPut> {
    return this.usersService.login(loginInput);
  }

  @Query(() => User)
  @Role(['Any'])
  //@UseGuards(AuthGuard)
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(() => UserProfileOutput)
  @Role(['Any'])
  //@UseGuards(AuthGuard)
  async userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.findById(userProfileInput.userId);
  }

  @Mutation(() => EditProfileOutput)
  @Role(['Any'])
  async editProfile(
    @AuthUser() user,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(user.id, editProfileInput);
  }

  @Mutation(() => DeleteProfileOutput)
  @Role(['Any'])
  async deleteProfile(@AuthUser() user): Promise<DeleteProfileOutput> {
    return await this.usersService.deleteProfile(user.id, user.email);
  }

  @Mutation(() => VerifyEmailOutput)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }
}
