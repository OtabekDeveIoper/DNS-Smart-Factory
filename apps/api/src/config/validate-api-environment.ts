import {
  apiEnvironmentSchema,
  type ApiEnvironment,
} from './api-environment.schema';

export function validateApiEnvironment(
  environment: Record<string, unknown>,
): ApiEnvironment {
  const result = apiEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.join('.') || 'environment';

        return `${field}: ${issue.message}`;
      })
      .join('; ');

    throw new Error(`Invalid API environment: ${details}`);
  }

  return result.data;
}
