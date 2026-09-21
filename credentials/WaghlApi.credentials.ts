import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
  Icon,
} from 'n8n-workflow';

export class WaghlApi implements ICredentialType {
  name = 'waghlApi';
  displayName = 'WAGHL API';
  documentationUrl = 'https://waghl.com';

  icon: Icon = 'file:../icons/waghl.svg';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Your WAGHL API key',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://custom2.waghl.com',
      required: true,
      description: 'WAGHL API base URL',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      body: {
        api_key: '={{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.baseUrl}}',
      url: '/authenticate-apikey',
      method: 'POST',
    },
  };
}
