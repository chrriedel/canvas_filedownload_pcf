import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface DownloadRequest {
  fileName: string;
  contentType: string;
  content: string;
}

export class FileDownloadControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _lastRequest: string | null = null;
  private _container: HTMLDivElement;

  constructor() {
    // Empty
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this._container = container;
    this._container.style.display = "none";
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const requestJson = context.parameters.DownloadRequest?.raw;

    // Only act when the value changes to something new and non-empty
    if (!requestJson || requestJson === this._lastRequest) {
      return;
    }
    this._lastRequest = requestJson;

    let request: DownloadRequest;
    try {
      request = JSON.parse(requestJson);
    } catch {
      return;
    }

    if (!request.content || !request.contentType) {
      return;
    }

    this.downloadFile(request.content, request.contentType, request.fileName || "download");
  }

  private downloadFile(base64Content: string, contentType: string, fileName: string): void {
    // Strip a potential data-URL prefix (e.g. "data:application/pdf;base64,...")
    const dataUrlMatch = base64Content.match(/^data:[^;]+;base64,(.+)$/s);
    const base64Data = dataUrlMatch ? dataUrlMatch[1] : base64Content;

    let byteNumbers: Uint8Array;
    try {
      const byteCharacters = atob(base64Data);
      byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
    } catch (e) {
      console.error("FileDownloadControl: failed to decode base64 content", e);
      return;
    }

    const blob = new Blob([byteNumbers], { type: contentType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    window.setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    }, 100);
  }

  public getOutputs(): IOutputs {
    return {};
  }

  public destroy(): void {
    // Nothing to clean up
  }
}
