import { IInputs, IOutputs } from "./generated/ManifestTypes";

interface FileContentRecord {
  "$content-type": string;
  $content: string;
}

export class FileDownloadControl implements ComponentFramework.StandardControl<IInputs, IOutputs> {
  private _lastTrigger: boolean | null = null;
  private _container: HTMLDivElement;
  private _notifyOutputChanged: () => void;
  private _error = "";

  constructor() {
    // Empty
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement,
  ): void {
    this._notifyOutputChanged = notifyOutputChanged;
    this._container = container;
    this._container.style.display = "none";
  }

  public updateView(context: ComponentFramework.Context<IInputs>): void {
    const trigger = context.parameters.TriggerDownload?.raw;

    // Only act when the boolean value actually changes
    if (trigger === this._lastTrigger) {
      return;
    }
    this._lastTrigger = trigger;

    const setError = (msg: string): void => {
      this._error = msg;
      this._notifyOutputChanged();
    };

    const fileName = context.parameters.FileName?.raw;
    if (!fileName) {
      setError("FileName is empty.");
      return;
    }

    const contentJson = context.parameters.FileContent?.raw;
    if (!contentJson) {
      setError("FileContent is empty.");
      return;
    }

    let fileContent: FileContentRecord;
    try {
      fileContent = JSON.parse(contentJson);
    } catch {
      setError("FileContent is not valid JSON.");
      return;
    }

    const contentType = fileContent?.["$content-type"];
    const content = fileContent?.["$content"];
    if (!contentType) {
      setError("FileContent is missing $content-type.");
      return;
    }
    if (!content) {
      setError("FileContent is missing $content.");
      return;
    }

    const error = this.downloadFile(content, contentType, fileName);
    setError(error);
  }

  private downloadFile(base64Content: string, contentType: string, fileName: string): string {
    // Strip a potential data-URL prefix (e.g. "data:application/pdf;base64,..." or with parameters like "data:application/pdf;charset=utf-8;base64,...")
    const dataUrlMatch = base64Content.match(/^data:[^;]+(?:;[^;,]+)*;base64,([\s\S]+)$/);
    const base64Data = dataUrlMatch ? dataUrlMatch[1] : base64Content;

    let byteNumbers: Uint8Array;
    try {
      const byteCharacters = atob(base64Data);
      byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
    } catch (e) {
      return "Failed to decode base64 content.";
    }

    const blob = new Blob([byteNumbers.buffer as ArrayBuffer], { type: contentType });
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

    return "";
  }

  public getOutputs(): IOutputs {
    return { Error: this._error };
  }

  public destroy(): void {
    // Nothing to clean up
  }
}
