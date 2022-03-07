import { IntegrationValidationError } from '@jupiterone/integration-sdk-core';
import {
  createMockExecutionContext,
  Recording,
} from '@jupiterone/integration-sdk-testing';
import { integrationConfig } from '../test/config';
import { setupMimecastRecording } from '../test/recording';
import { IntegrationConfig } from './config';
import { validateInvocation } from './config';

describe('#validateInvocation', () => {
  let recording: Recording;

  afterEach(async () => {
    if (recording) {
      await recording.stop();
    }
  });
  test('requires valid config', async () => {
    const executionContext = createMockExecutionContext<IntegrationConfig>({
      instanceConfig: {} as IntegrationConfig,
    });

    await expect(validateInvocation(executionContext)).rejects.toThrow(
      IntegrationValidationError,
    );
  });
  /**
   * Testing a successful authorization can be done with recordings
   */
  test('successfully validates invocation', async () => {
    recording = setupMimecastRecording({
      directory: __dirname,
      name: 'validate-invocation',
    });

    // Pass integrationConfig to authenticate with real credentials
    const executionContext = createMockExecutionContext({
      instanceConfig: integrationConfig,
    });

    // successful validateInvocation doesn't throw errors and will be undefined
    await expect(validateInvocation(executionContext)).resolves.toBeUndefined();
  });

  /* Adding `describe` blocks segments the tests into logical sections
   * and makes the output of `yarn test --verbose` provide meaningful
   * to project information to future maintainers.
   */
  describe('fails validating invocation', () => {
    /**
     * Testing failing authorizations can be done with recordings as well.
     * For each possible failure case, a test can be made to ensure that
     * error messaging is expected and clear to end-users
     */
    describe('invalid user credentials', () => {
      test.each(Object.keys(integrationConfig))(
        'should throw if %p is invalid',
        async (key) => {
          recording = setupMimecastRecording({
            directory: __dirname,
            name: `${key}-auth-error`,
            // Many authorization failures will return non-200 responses
            // and `recordFailedRequest: true` is needed to capture these responses
            options: {
              recordFailedRequests: true,
            },
          });
          const instanceConfig = { ...integrationConfig };
          instanceConfig[key] = 'INVALID';

          const executionContext = createMockExecutionContext({
            instanceConfig,
          });

          if (key === 'appId') {
            await expect(validateInvocation(executionContext)).rejects.toThrow(
              'encountered known intermittent application id error:',
            );
          } else {
            // tests validate that invalid configurations throw an error
            // with an appropriate and expected message.
            await expect(validateInvocation(executionContext)).rejects.toThrow(
              'Provider authentication failed at https://us-api.mimecast.com/api/account/get-account: 401 Unauthorized',
            );
          }
        },
      );
    });
  });
});
