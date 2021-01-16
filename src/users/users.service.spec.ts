import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { async } from 'rxjs';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  findOneOrFail: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let usersRepository: MockRepository; //Partial<Record<keyof Repository<User>, jest.Mock>>;
  let verificationRepository: MockRepository;
  let mailService: MailService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        // mocking
      ],
    }).compile(); // create test module and compile
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(User));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: '',
      password: '',
      role: 0,
    };

    const verificationArgs = {
      code: '',
      user: createAccountArgs,
    };

    it('should fail if user exists', async () => {
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'testatata@tes.co',
      });

      const result = await service.createAccount(createAccountArgs);

      expect(result).toMatchObject({
        ok: false,
        error: 'There is a user with that email already',
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockReturnValue(createAccountArgs);
      verificationRepository.create.mockReturnValue(verificationArgs);
      verificationRepository.save.mockReturnValue(verificationArgs);

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        verificationArgs,
      );
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
      );
      expect(result).toMatchObject({
        ok: true,
      });
    });

    it('should fail if there is an exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('error'));

      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'Could not create account',
      });
    });
  });
  describe('login', () => {
    const loginArgs = {
      email: 't@t.com',
      password: '123',
    };

    it('should fail if user not exists', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toMatchObject({
        ok: false,
        error: 'User not found',
      });
    });

    it('should fail if the password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);
      expect(result).toMatchObject({
        ok: false,
        error: 'Wrong Password',
      });
    });

    it('should return token if password correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      usersRepository.findOne.mockResolvedValue(mockedUser);

      const result = await service.login(loginArgs);

      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));
      expect(result).toMatchObject({
        ok: true,
        token: 'signed-token',
      });
    });

    it('should fail if there is an exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('error'));

      const result = await service.login({
        email: '',
        password: '',
      });

      expect(result).toMatchObject({
        ok: false,
        error: 'Could not login',
      });
    });
  });

  describe('findById', () => {
    const mockedUser = {
      id: 1,
      email: 'testatata@tes.co',
    };

    it('should return a user', async () => {
      usersRepository.findOneOrFail.mockResolvedValue(mockedUser);

      const result = await service.findById(1);

      expect(result).toMatchObject({
        ok: true,
        user: mockedUser,
      });
    });

    it('should fail if there is an exception', async () => {
      usersRepository.findOneOrFail.mockRejectedValue(new Error('error'));
      const result = await service.findById(1);

      expect(result).toMatchObject({
        ok: false,
        error: 'User Not Found',
      });
    });
  });

  describe('editProfile', () => {
    const verificationArgs = {
      code: 'code',
    };
    const editProfileArgs = {
      userId: 1,
      input: { email: 'tesatata@new.co' },
    };
    const oldUser = {
      id: 1,
      email: 'testatata@tes.co',
      emailVerified: true,
    };
    const newUser = {
      id: 1,
      email: editProfileArgs.input.email,
      emailVerified: false,
    };

    it('should edit email', async () => {
      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(verificationArgs);
      verificationRepository.save.mockReturnValue(verificationArgs);

      const result = await service.editProfile(
        editProfileArgs.userId,
        editProfileArgs.input,
      );

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        editProfileArgs.userId,
      );

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        verificationArgs,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        newUser.email,
        verificationArgs.code,
      );

      expect(result).toMatchObject({ ok: true });
    });

    it('should fail if there is an exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('error'));
      const result = await service.editProfile(
        expect.any(String),
        expect.any(Object),
      );

      expect(result).toMatchObject({
        ok: false,
        error: new Error('error'),
      });
    });
  });
  it.todo('deleteProfile');
  describe('deleteProfile', () => {
    const deleteProfileArgs = {
      id: 1,
      email: 't@t.com',
    };
    it('should delete a user', async () => {
      usersRepository.delete.mockResolvedValue(true);
      const result = await service.deleteProfile(
        deleteProfileArgs.id,
        deleteProfileArgs.email,
      );

      expect(result).toMatchObject({ ok: true });
    });

    it('should fail if there is an exception', async () => {
      usersRepository.delete.mockRejectedValue(new Error('error'));
      const result = await service.deleteProfile(
        deleteProfileArgs.id,
        deleteProfileArgs.email,
      );

      expect(result).toMatchObject({
        ok: false,
        error: new Error('error'),
      });
    });
  });

  it.todo('verifyEmail');
});
