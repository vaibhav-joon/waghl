import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from 'n8n-workflow';

import {
  NodeApiError,
  NodeConnectionTypes,
  NodeOperationError,
} from 'n8n-workflow';

export class Waghl implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'WAGHL',
    name: 'waghl',
    icon: 'file:../../icons/waghl.svg',
    group: ['output'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Send WhatsApp messages through the WAGHL API',
    defaults: {
      name: 'WAGHL',
    },
    usableAsTool: true,
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: 'waghlApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [{ name: 'WhatsApp', value: 'whatsapp' }],
        default: 'whatsapp',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Send Text Message',
            value: 'sendText',
            action: 'Send a text message',
          },
          {
            name: 'Send Media',
            value: 'sendMedia',
            action: 'Send media',
          },
          {
            name: 'Send Document',
            value: 'sendDocument',
            action: 'Send a document',
          },
        ],
        default: 'sendText',
      },
      {
        displayName: 'Sender',
        name: 'sender',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+919876543210',
        description: 'WhatsApp sender number connected to WAGHL',
      },
      {
        displayName: 'Recipient',
        name: 'number',
        type: 'string',
        default: '',
        required: true,
        placeholder: '+14155552671',
        description: 'Recipient WhatsApp number',
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        typeOptions: { rows: 4 },
        default: '',
        required: true,
        displayOptions: {
          show: { operation: ['sendText'] },
        },
      },
      {
        displayName: 'Media Type',
        name: 'mediaType',
        type: 'options',
        options: [
          { name: 'Image', value: 'image' },
          { name: 'Video', value: 'video' },
          { name: 'Audio', value: 'audio' },
        ],
        default: 'image',
        required: true,
        displayOptions: {
          show: { operation: ['sendMedia'] },
        },
      },
      {
        displayName: 'Media URL',
        name: 'mediaUrl',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'https://example.com/file.jpg',
        displayOptions: {
          show: { operation: ['sendMedia'] },
        },
      },
      {
        displayName: 'Caption',
        name: 'mediaCaption',
        type: 'string',
        default: '',
        displayOptions: {
          show: { operation: ['sendMedia'] },
        },
      },
      {
        displayName: 'Send as Voice Note',
        name: 'ptt',
        type: 'boolean',
        default: true,
        description: 'Whether to send audio as a push-to-talk voice note',
        displayOptions: {
          show: {
            operation: ['sendMedia'],
            mediaType: ['audio'],
          },
        },
      },
      {
        displayName: 'Document URL',
        name: 'documentUrl',
        type: 'string',
        default: '',
        required: true,
        placeholder: 'https://example.com/file.pdf',
        displayOptions: {
          show: { operation: ['sendDocument'] },
        },
      },
      {
        displayName: 'Caption',
        name: 'documentCaption',
        type: 'string',
        default: '',
        displayOptions: {
          show: { operation: ['sendDocument'] },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const credentials = await this.getCredentials('waghlApi');

const baseUrl = String(credentials.baseUrl ?? '').trim().replace(/\/+$/, '');

if (!baseUrl) {
  throw new NodeOperationError(this.getNode(), 'WAGHL Base URL is missing');
}
    if (!baseUrl) {
      throw new NodeOperationError(this.getNode(), 'WAGHL Base URL is missing');
    }

    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      try {
        const operation = this.getNodeParameter('operation', itemIndex) as string;
        const sender = String(this.getNodeParameter('sender', itemIndex, '')).trim();
        const number = String(this.getNodeParameter('number', itemIndex, '')).trim();

        if (!sender) {
          throw new NodeOperationError(this.getNode(), 'Sender cannot be empty', { itemIndex });
        }
        if (!number) {
          throw new NodeOperationError(this.getNode(), 'Recipient cannot be empty', { itemIndex });
        }

        let endpoint: string;
        let body: IDataObject;

        if (operation === 'sendText') {
          const message = String(this.getNodeParameter('message', itemIndex, ''));
          if (!message.trim()) {
            throw new NodeOperationError(this.getNode(), 'Message cannot be empty', { itemIndex });
          }
          endpoint = '/send-message';
          body = { api_key: apiKey, sender, number, message };
        } else if (operation === 'sendMedia') {
          const mediaType = this.getNodeParameter('mediaType', itemIndex) as string;
          const url = String(this.getNodeParameter('mediaUrl', itemIndex, '')).trim();
          const caption = String(this.getNodeParameter('mediaCaption', itemIndex, ''));

          if (!url) {
            throw new NodeOperationError(this.getNode(), 'Media URL cannot be empty', { itemIndex });
          }

          endpoint = '/send-media';
          body = { api_key: apiKey, sender, number, media_type: mediaType, url };

          if (caption) body.caption = caption;
          if (mediaType === 'audio') {
            body.ptt = this.getNodeParameter('ptt', itemIndex, true) as boolean;
          }
        } else if (operation === 'sendDocument') {
          const url = String(this.getNodeParameter('documentUrl', itemIndex, '')).trim();
          const caption = String(this.getNodeParameter('documentCaption', itemIndex, ''));

          if (!url) {
            throw new NodeOperationError(this.getNode(), 'Document URL cannot be empty', { itemIndex });
          }

          endpoint = '/send-document';
          body = { api_key: apiKey, sender, number, media_type: 'document', url };
          if (caption) body.caption = caption;
        } else {
          throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`, {
            itemIndex,
          });
        }

        const response = await this.helpers.httpRequest({
          method: 'POST',
          url: `${baseUrl}${endpoint}`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body,
          json: true,
        });

        const responseJson: IDataObject =
          response !== null && typeof response === 'object'
            ? (response as IDataObject)
            : { data: response as string | number | boolean };

        returnData.push({
          json: responseJson,
          pairedItem: { item: itemIndex },
        });
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown WAGHL API error',
            },
            pairedItem: { item: itemIndex },
          });
          continue;
        }

        if (error instanceof NodeOperationError) {
          throw error;
        }

        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
      }
    }

    return [returnData];
  }
}
