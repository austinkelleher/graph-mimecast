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
