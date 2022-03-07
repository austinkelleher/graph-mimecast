import {
  setupRecording,
  Recording,
  SetupRecordingInput,
  mutations,
} from '@jupiterone/integration-sdk-testing';

export { Recording };

export function setupMimecastRecording(
  input: Omit<SetupRecordingInput, 'mutateEntry'>,
): Recording {
  return setupRecording({
    mutateEntry: mutations.unzipGzippedRecordingEntry,
    options: {
      matchRequestsBy: {
        url: {
          hostname: false,
        },
      },
      recordFailedRequests: false,
    },
    ...input,
    redactedRequestHeaders: ['Authorization', 'x-mc-app-id'],
    redactedResponseHeaders: ['set-cookie'],
  });
}
