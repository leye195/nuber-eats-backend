import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInPut } from './dtos/createAccount.dto';
import { LoginInput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { DeleteProfileOutput } from './dtos/delete-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) //User Entity를 Repository로 inject
    private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInPut): Promise<{ ok: boolean; error?: string }> {
    // check new user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        // make error
        return { ok: false, error: 'There is a user with that email already' };
      }

      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      // make error
      // console.log(e);
      return { ok: false, error: 'Could not create account' };
    }
    // hash the password
    // return ok or error
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    try {
      const user = await this.users.findOne(
        { email },
        {
          select: ['id', 'password'],
        },
      );

      if (!user) {
        return {
          ok: false,
          error: 'User not found',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong Password',
        };
      }
      const token = this.jwtService.sign({ id: user.id });
      return { ok: true, token };
    } catch (e) {
      // console.log(e);
      return { ok: false, error: 'Could not login' };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });
      return {
        ok: true,
        user,
      };
    } catch (e) {
      return { ok: false, error: 'User Not Found' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (email) {
        user.email = email;
        user.emailVerified = false;
        const verification = await this.verifications.save(
          this.verifications.create({
            user,
          }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (e) {
      return {
        ok: false,
        error: e,
      };
    }
  }

  async deleteProfile(id: number, email: string): Promise<DeleteProfileOutput> {
    try {
      await this.users.delete({ id, email });
      return {
        ok: true,
      };
    } catch (e) {
      // console.log(e);
      return {
        ok: false,
        error: e,
      };
    }
  }

  async verifyEmail({ code }: VerifyEmailInput): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (verification) {
        verification.user.emailVerified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'Verification not found.',
      };
    } catch (e) {
      // console.log(e);
      return {
        ok: false,
        error: e,
      };
    }
  }
}
