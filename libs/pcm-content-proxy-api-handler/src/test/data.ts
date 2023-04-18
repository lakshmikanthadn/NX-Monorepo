// eslint-disable-next-line max-len
import { ContentProxyHandlerConfig } from '../model/interface/contentProxyHandlerConfig';
import AuthService from '../services/authService';
import { ProxyOrgService } from '../services/proxyOrgService';

// eslint-disable-next-line max-len
export const testBotIPToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcCI6IjY2LjI0OS43Mi4xMSIsImNvdW50cnlfY29kZSI6IlVTIiwic2NvcGUiOlsiZ29vZ2xlX3NjaG9sYXJfYm90IiwicHJvZHVjdF9hY2Nlc3MiLCJ1bmxpY2Vuc2VkX3NlYXJjaCJdLCJjb250ZW50X2NlbnNvcmluZ19lbmFibGVkIjpmYWxzZSwiciI6WyJCVVMiXSwidGVycml0b3J5X3R5cGUiOiJjb3VudHJ5IiwidXNlciI6eyJ1c2VyVHlwZSI6ImlwIiwiX2lkIjoiNjAzMzg0NDZiNTFmODEwMDFmMTUxYTRkIiwidXNlcm5hbWUiOiI2Ni4yNDkuNzIuMTEiLCJvcmdhbml6YXRpb25JZCI6IjM4NDU5Iiwib3JnYW5pemF0aW9uTmFtZSI6Ikdvb2dsZSBTY2hvbGFyIEJvdCJ9LCJpc3MiOiJodHRwczovL2FjY291bnRzLWRldi50YXlsb3JmcmFuY2lzLmNvbS9pZGVudGl0eS8iLCJleHAiOjE2MTQzMjcwMzksImlhdCI6MTYxNDMyMzQzOSwiYXVkIjoiMzhhMGY2NGZhMGNiNTFhZTAwZjY5ZWZlMjU0ZmExMGNlNzNmZjZkYWVkMTQwNjk3MmU2ZDczZDVjZmMzNTM0OSIsInN1YiI6IjYwMzM4NDQ2YjUxZjgxMDAxZjE1MWE0ZCJ9.fP7EGgnuAZM7rQ9ruwqaMotyF_md9-yp2Bg5qSQAUSBuicGsQVlN2UHoa4GgOsrKlmb-HHeSUOUgiOJXsDeUs6pIVOViy-TI3uVVtS76Du2r4b0T__UDSUceVntvbTBp3EQGXrWDJ6fJkBH6Bv3T7UD5YJHycP8XoRlpHhm07R9tAieSozL4viANnztmBz1oV4np81Wdfnas41TmAGJo8bC7nYkdVD830I6Vjbb8Ozst0c3H8M3DNXn3R6b39GDpG_yofI4pUZ5J1xLW_wFWl99L215sZmkHcFqG8_UtNB3RK7EY4vm6gx13JZg2JNhrsMBpk4fMzkL3lSIbl2JAlw';
// eslint-disable-next-line max-len
export const testUserIPToken =
  'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpcCI6IjEzMC4xMTcuMTI0LjEwIiwiY291bnRyeV9jb2RlIjoiR0IiLCJzY29wZSI6WyJwcm9kdWN0X2FjY2VzcyIsInVubGljZW5zZWRfc2VhcmNoIl0sImNvbnRlbnRfY2Vuc29yaW5nX2VuYWJsZWQiOmZhbHNlLCJyIjpbIkJVUyJdLCJ0ZXJyaXRvcnlfdHlwZSI6ImNvdW50cnkiLCJ1c2VyIjp7InVzZXJUeXBlIjoiaXAiLCJfaWQiOiI2MDAxNjRlMzU5ZGY0ZTAwMjA3MmUzNTkiLCJ1c2VybmFtZSI6IjEzMC4xMTcuMTI0LjEwIiwib3JnYW5pemF0aW9uSWQiOiIyMCIsIm9yZ2FuaXphdGlvbk5hbWUiOiJUYXlsb3IgQW5kIEZyYW5jaXMgR3JvdXAifSwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy1kZXYudGF5bG9yZnJhbmNpcy5jb20vaWRlbnRpdHkvIiwiZXhwIjoxNjE0MzI3NDI4LCJpYXQiOjE2MTQzMjM4MjgsImF1ZCI6IjM4YTBmNjRmYTBjYjUxYWUwMGY2OWVmZTI1NGZhMTBjZTczZmY2ZGFlZDE0MDY5NzJlNmQ3M2Q1Y2ZjMzUzNDkiLCJzdWIiOiI2MDAxNjRlMzU5ZGY0ZTAwMjA3MmUzNTkifQ.NpvciKu8gcuqCVLgzpd-brBSY20_JLeZ7xHeAEzDdylhpTWrvjxsaQOqAGdqNzge7dwbWn9IThJKwwttvUjbjs2RXh6gcipWUBu1JjXKz7ifWq27m4PCsELy2ruTLSrfXTbBEPPjB_n6dymFWAMiM5buygqLaOqyQ777k9RQVk3gcoR-UzyMrLZszaX3GGGAqtPF7A7Zs1cvOUeUz_als8O1Cpw32A7TwtD45v3NtvY4zFyN2ZyMG3LtiuV5bUgXIH6naXSE49p_LjJ7yjNDHb29htq4SvclOum_0IX0dpKmShqbDOh0FeFQHa3tSC59Ct8rPSLwjVq9w0U1Vxa7Qw';

export const testClientID = 'test_client_id';
export const testClientSecret = 'test_client_secret';
export const testIP = '1.1.1.1';
export const testAuthTokenAPIUrl = 'https://api.example.com';
export const testPropertiesAPIUrl = 'https://api.example.com';
export const testBotOrgName = 'Google Scholar Bot';
export const parties = ['1822334', '234123'];
export const propertiesApiUrl = 'https://api.example.com';

export const getTestAuthService = function (): AuthService {
  return new AuthService(testClientID, testClientSecret, testAuthTokenAPIUrl);
};

export const getProxyOrgService = function (): ProxyOrgService {
  return new ProxyOrgService(testPropertiesAPIUrl);
};

export const testContentProxyHandlerConfig: ContentProxyHandlerConfig = {
  authTokenAPIUrl: testAuthTokenAPIUrl,
  botOrgName: testBotOrgName,
  clientID: testClientID,
  clientSecret: testClientSecret,
  propertiesAPIUrl: testPropertiesAPIUrl
};