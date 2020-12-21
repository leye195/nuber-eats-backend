import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountInPut } from './dtos/createAccount.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) //User Entity를 Repository로 inject
    private readonly users: Repository<User>,
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
      await this.users.save(this.users.create({ email, password, role }));
      return { ok: true };
    } catch (e) {
      // make error
      console.log(e);
      return { ok: false, error: 'Could not create account' };
    }
    // hash the password
    // return ok or error
  }
}
