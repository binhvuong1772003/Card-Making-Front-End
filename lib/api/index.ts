import { createApiClient } from './client';
import { API_URL } from './config';

export { API_URL } from './config';
export { ApiError, isApiError, type ApiErrorCode } from './errors';

// Mọi lời gọi tới backend đi qua đây: `apiFetch` cho REST, `apiFetch.graphql` cho GraphQL.
export const apiFetch = createApiClient({ baseUrl: API_URL });
