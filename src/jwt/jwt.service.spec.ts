import { Test } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';

const TEST_KEY = 'TEST_KEY';
const USER_ID = 1;

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({ id: USER_ID })),
  };
});

describe('JwtService', () => {
  let service: JwtService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { privateKey: TEST_KEY },
        },
      ],
    }).compile();
    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const id = USER_ID;
      const token = service.sign({ id });

      expect(jwt.sign).toHaveBeenCalledWith({ id }, TEST_KEY);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(typeof token).toBe('string');
      expect(token).toEqual('TOKEN');
    });
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const data = service.verify('TOKEN');

      expect(jwt.verify).toHaveBeenCalledWith('TOKEN', TEST_KEY);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(data).toEqual({ id: USER_ID });
    });
  });
});
