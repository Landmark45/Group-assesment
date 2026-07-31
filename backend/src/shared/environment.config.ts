import dotenv from 'dotenv';

dotenv.config();

/**
 * Every environment value the application depends on, resolved once at boot so
 * that a missing variable fails loudly at startup rather than mid-request.
 */
export interface ApplicationEnvironmentConfiguration {
  readonly nodeEnvironment: 'development' | 'test' | 'production';
  readonly httpPort: number;
  readonly mongoDbConnectionUri: string;
  readonly jsonWebTokenSecret: string;
  readonly jsonWebTokenExpiresIn: string;
  readonly allowedClientOrigins: readonly string[];
}

function readRequiredEnvironmentVariable(variableName: string, fallbackValue?: string): string {
  const rawValue = process.env[variableName];
  if (rawValue !== undefined && rawValue.trim() !== '') {
    return rawValue.trim();
  }
  if (fallbackValue !== undefined) {
    return fallbackValue;
  }
  throw new Error(
    `Missing required environment variable "${variableName}". Copy backend/.env.example to backend/.env and fill it in.`
  );
}

function readNumericEnvironmentVariable(variableName: string, fallbackValue: number): number {
  const rawValue = process.env[variableName];
  if (rawValue === undefined || rawValue.trim() === '') {
    return fallbackValue;
  }
  const parsedValue = Number.parseInt(rawValue, 10);
  if (Number.isNaN(parsedValue)) {
    throw new Error(`Environment variable "${variableName}" must be a number, received "${rawValue}".`);
  }
  return parsedValue;
}

function resolveNodeEnvironment(): ApplicationEnvironmentConfiguration['nodeEnvironment'] {
  const rawValue = process.env['NODE_ENV'];
  if (rawValue === 'production' || rawValue === 'test') {
    return rawValue;
  }
  return 'development';
}

const nodeEnvironment = resolveNodeEnvironment();

export const environmentConfiguration: ApplicationEnvironmentConfiguration = {
  nodeEnvironment,
  httpPort: readNumericEnvironmentVariable('PORT', 4100),
  mongoDbConnectionUri: readRequiredEnvironmentVariable(
    'MONGODB_CONNECTION_URI',
    'mongodb://127.0.0.1:27017/educonnect_platform'
  ),
  jsonWebTokenSecret: readRequiredEnvironmentVariable(
    'JSON_WEB_TOKEN_SECRET',
    nodeEnvironment === 'production' ? undefined : 'educonnect-development-only-secret'
  ),
  jsonWebTokenExpiresIn: readRequiredEnvironmentVariable('JSON_WEB_TOKEN_EXPIRES_IN', '7d'),
  allowedClientOrigins: readRequiredEnvironmentVariable(
    'ALLOWED_CLIENT_ORIGINS',
    'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0),
};
