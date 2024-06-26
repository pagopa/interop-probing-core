export const awsConfigs = {
  aws_project_region: import.meta.env.VITE_AWS_PROJECT_REGION,
  aws_cognito_identity_pool_id: null,
  aws_cognito_region: import.meta.env.VITE_AWS_COGNITO_REGION,
  aws_user_pools_id: import.meta.env.VITE_AWS_USER_POOL_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_AWS_USER_POOLS_WEB_CLIENT_ID,
  oauth: {},
  aws_cognito_username_attributes: ['EMAIL'],
  aws_cognito_social_providers: [],
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_mfa_types: [],
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: [],
  },
  aws_cognito_verification_mechanisms: ['EMAIL'],
}
