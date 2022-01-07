import {
  setupRecording,
  Recording,
  SetupRecordingInput,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupMimecastRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    ...input,
    options: {
      matchRequestsBy: {
        url: {
          hostname: false,
        },
      },
      recordFailedRequests: false,
    },
    redactedRequestHeaders: ['Authorization', 'x-mc-app-id'],
  });
}
