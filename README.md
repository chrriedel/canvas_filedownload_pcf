# FileDownloadControl

A PowerApps Component Framework (PCF) control that triggers a file download in the browser from a base64-encoded payload. It renders no visible UI — simply bind a JSON string to its input property and the control handles decoding and downloading the file.

## How It Works

Place the control on a form or canvas app. When the bound input property changes to a new, non-empty value, the control parses the JSON, converts the base64 content to a binary blob, and initiates a browser download.

## Input

The control exposes a single input property:

### `DownloadRequest` _(Multiple / Text)_

A JSON string with the following fields:

| Field         | Type     | Required | Description                                                                                                                                                         |
| ------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fileName`    | `string` | No       | Name for the downloaded file (defaults to `"download"` if omitted).                                                                                                 |
| `contentType` | `string` | **Yes**  | MIME type of the file (e.g. `application/pdf`, `image/png`).                                                                                                        |
| `content`     | `string` | **Yes**  | The file contents encoded as a **base64** string.                                                                                                                   |
| `_ts`         | `number` | No       | Timestamp (e.g. `Date.now()`). Change this value to re-trigger a download of the same file, since the control compares the full JSON string to detect new requests. |

**Example value:**

```json
{
  "fileName": "report.pdf",
  "contentType": "application/pdf",
  "content": "JVBERi0xLjQK...",
  "_ts": 1741795200000
}
```

The control only triggers a download when `DownloadRequest` changes to a value it hasn't already processed and both `contentType` and `content` are present. Invalid JSON is silently ignored.

## Getting Started

### Prerequisites

- Node.js (v18+)
- .NET SDK (for `pcf-scripts`)
- Power Platform CLI (`pac`)

### Install & Build

```bash
npm install
npm run build
```

### Local Development

```bash
npm start
# or with watch mode
npm run start:watch
```

### Deploy to Dataverse

```bash
pac pcf push --publisher-prefix <your-prefix>
```

## Project Structure

```
FileDownloadControl/
  ControlManifest.Input.xml   # Component metadata & property definitions
  index.ts                    # Control implementation
  generated/
    ManifestTypes.d.ts        # Auto-generated type definitions
```

## License

[MIT](LICENSE) — Christof Riedel
