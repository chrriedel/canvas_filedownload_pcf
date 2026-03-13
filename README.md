# FileDownloadControl

A PowerApps Component Framework (PCF) control that triggers a file download in the browser from a base64-encoded payload. It renders no visible UI — bind the file name, file content, and a trigger boolean to its input properties and the control handles decoding and downloading the file.

## How It Works

Place the control on a form or canvas app. When the `TriggerDownload` boolean changes value, the control reads the current `FileContent` JSON, converts the base64 content to a binary blob, and initiates a browser download using the provided `FileName`.

## Input Properties

The control exposes three input properties:

### `FileName` _(SingleLine.Text)_

The name for the downloaded file (e.g. `"report.pdf"`). This value must not be empty; otherwise the control returns the `FileName is empty.` error.

### `FileContent` _(Multiple / Text)_

A JSON string representing the file content record with the following fields:

| Field           | Type     | Required | Description                                                  |
| --------------- | -------- | -------- | ------------------------------------------------------------ |
| `$content-type` | `string` | **Yes**  | MIME type of the file (e.g. `application/pdf`, `image/png`). |
| `$content`      | `string` | **Yes**  | The file contents encoded as a **base64** string.            |

**Example value:**

```json
{
  "$content-type": "application/pdf",
  "$content": "JVBERi0xLjQK..."
}
```

In Power Apps, pass this using `JSON(yourVariable.filecontent)` — the component handles parsing internally.

### `TriggerDownload` _(TwoOptions / Boolean)_

Toggle this boolean to trigger the download. The control fires a download each time the value changes (e.g. from `false` to `true` or vice versa).

The control only downloads when both `$content-type` and `$content` are present in the `FileContent` JSON. If the `FileContent` value is not valid JSON, the control does not download and instead sets the `Error` output to `FileContent is not valid JSON.`.

## Output Properties

### `Error` _(SingleLine.Text)_

Returns an error message if the download failed, or an empty string on success. Possible errors:

- `FileName is empty.`
- `FileContent is empty.`
- `FileContent is not valid JSON.`
- `FileContent is missing $content-type.`
- `FileContent is missing $content.`
- `Failed to decode base64 content.`

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
