import { workerEnvironmentSchema } from "./worker-environment.schema";

export function validateWorkerEnvironment(
  environment: Record<string, unknown>,
) {
  const result = workerEnvironmentSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.join(".") || "environment";

        return `${field}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(`Invalid worker environment: ${details}`);
  }

  return result.data;
}
