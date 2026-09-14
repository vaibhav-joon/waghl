# n8n-nodes-waghl

An n8n community node for sending WhatsApp messages through the [WAGHL API](https://waghl.com/).

This package is not affiliated with n8n. WAGHL is a third-party WhatsApp service for GoHighLevel.

## Features

- Send text messages
- Send images, videos, audio, and WhatsApp voice notes
- Send documents with an optional caption
- Use n8n expressions in every message field
- Process one request per incoming item and preserve item pairing

## Installation

### Self-hosted n8n

1. In n8n, go to **Settings** > **Community nodes**.
2. Select **Install** and enter `n8n-nodes-waghl`.
3. Confirm installation, then add **WAGHL** to a workflow.

### n8n Cloud

After n8n verifies this package, workspace owners can find it in the node panel and install it from the community section. Until then, unverified packages can only be installed on self-hosted n8n.

## Credentials

Create a **WAGHL API** credential and provide:

- **API Key**: The API key issued by WAGHL.
- **Base URL**: The HTTPS base URL issued for your WAGHL API. Do not include `/send-message`, `/send-media`, or `/send-document`, and do not add a trailing slash.

The node sends the API key in the request body as `api_key`, as required by the current WAGHL endpoint contract used by this integration. Do not put keys in workflow fields or commit them to source control.

## Operations

| Operation | Endpoint | Required fields |
| --- | --- | --- |
| Send Text Message | `POST /send-message` | Sender, Recipient, Message |
| Send Media | `POST /send-media` | Sender, Recipient, Media Type, Media URL |
| Send Document | `POST /send-document` | Sender, Recipient, Document URL |

Media supports `image`, `video`, and `audio`; audio can be sent as a voice note. Captions are optional for media and documents.

## Example workflow

Import [examples/send-text-message.json](examples/send-text-message.json), choose your WAGHL credential, and replace the sample phone numbers before executing it. For data-driven workflows, fields accept normal n8n expressions, for example:

```text
Recipient: {{$json.phone}}
Message: Hello {{$json.firstName}}, thanks for contacting us!
```

## Development

Use Node.js 22 or newer.

```bash
npm install
npm test
npm run dev
```

`npm test` runs the n8n linter and production build. Test every operation against a non-production WAGHL account before release; this repository deliberately contains no API keys or real recipient numbers.

## Release and verification

The GitHub Actions workflows validate every change and publish releases with npm provenance. From May 1, 2026, n8n requires a provenance-attested GitHub Actions publish for community-node verification.

Before creating the first GitHub release:

1. Confirm that this repository is public at `https://github.com/vaibhav-joon/waghl` and that the package metadata points to that exact URL. If the repository moves, update `repository`, `bugs`, and this URL together before publishing.
2. Ensure the unscoped npm package name `n8n-nodes-waghl` is available to the WAGHL npm owner. If it is unavailable, rename the package to `@waghl/n8n-nodes-waghl` and keep the `n8n-nodes-` prefix after the scope.
3. Push the `main` branch, enable GitHub Actions, and configure npm Trusted Publishing for this repository and the `npm` GitHub environment. Do not publish from a local computer.
4. Create a GitHub Release with tag `v1.0.0`. The publish workflow will run validation and publish with `--provenance`.
5. Confirm the npm package contains only the expected `dist` files, README, and license. Run `npx @n8n/scan-community-package n8n-nodes-waghl` after publication.
6. Submit the published package in the n8n Creator Portal for verification, providing the npm package URL, public GitHub repository, documentation, and this example workflow.

## Security and support

This node makes outbound HTTPS requests only to the Base URL saved in the selected credential. It does not read environment variables or local files, and it has no runtime npm dependencies.

For WAGHL API access and product support, visit [WAGHL Help](https://waghl.com/help/).

## License

[MIT](LICENSE.md)
