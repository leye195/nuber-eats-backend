import { Test } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';
import * as FormData from 'form-data';
import got from 'got';

const TEST_KEY = 'TEST_KEY';
const TEST_DOMAIN = 'TEST_DOMAIN';
const TEST_FROM_EMAIL = 'TEST_FROM_EMAIL';

const USER_MAIL = 'USER_MAIL';

jest.mock('got');
jest.mock('form-data');

describe('mailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: {
            apiKey: TEST_KEY,
            domain: TEST_DOMAIN,
            fromEmail: TEST_FROM_EMAIL,
          },
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should call sendEmail', () => {
      const sendVerificationEmailArgs = {
        email: USER_MAIL,
        code: 'abc',
      };
      jest.spyOn(service, 'sendEmail').mockImplementation(async () => {
        return true;
      });
      service.sendVerificationEmail(
        sendVerificationEmailArgs.email,
        sendVerificationEmailArgs.code,
      );

      expect(service.sendEmail).toHaveBeenCalledTimes(1);
      expect(service.sendEmail).toHaveBeenCalledWith(
        'Verify Your Email',
        'verify_email',
        sendVerificationEmailArgs.email,
        [
          { key: 'code', value: sendVerificationEmailArgs.code },
          { key: 'username', value: sendVerificationEmailArgs.email },
        ],
      );
    });
  });

  //it.todo('sendMail');
  describe('sendMail', () => {
    it('should send email', async () => {
      const to = 'to';
      const subject = 'subject';
      const template = 'template';
      const emailVars = [{ key: 'key', value: 'value' }];

      const formSpy = jest.spyOn(FormData.prototype, 'append');
      const result = await service.sendEmail(subject, template, to, emailVars);

      expect(formSpy).toHaveBeenCalled();
      expect(got.post).toHaveBeenCalledTimes(1);
      expect(got.post).toHaveBeenCalledWith(
        `https://api.mailgun.net/v3/${TEST_DOMAIN}/messages`,
        expect.any(Object),
      );
      expect(result).toEqual(true);
    });

    it('should fail on error', async () => {
      const to = 'to';
      const subject = 'subject';
      const template = 'template';
      const emailVars = [{ key: 'key', value: 'value' }];

      jest.spyOn(got, 'post').mockImplementation(() => {
        throw new Error();
      });
      const result = await service.sendEmail(subject, template, to, emailVars);
      expect(result).toEqual(false);
    });
  });
});
