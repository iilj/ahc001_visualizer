export class TextFileReader {
  private element: HTMLInputElement;
  public completed: boolean;
  public result: string = '';
  public onCompleted: () => void;
  public onFailed: () => void;

  constructor(
    elementId: string,
    onCompleted: () => void = () => {},
    onFailed: () => void = () => {}
  ) {
    this.completed = false;
    this.onCompleted = onCompleted;
    this.onFailed = onFailed;

    this.element = document.getElementById(elementId) as HTMLInputElement;
    this.element.addEventListener(
      'change',
      (evt) => {
        const files: FileList = (evt.target as HTMLInputElement)
          .files as FileList;
        if (files.length === 0) {
          alert('ファイルが選択されませんでした');
          void this.onFailed();
          return;
        }
        if (files.length !== 1) {
          alert('ファイル数が不正です');
          void this.onFailed();
          return;
        }

        const file: File = files[0];
        const reader: FileReader = new FileReader();
        reader.onload = (ev: ProgressEvent<FileReader>): void => {
          this.result = (ev.target as FileReader).result as string;
          this.completed = true;
          void this.onCompleted();
        };
        reader.readAsText(file);
      },
      false
    );
  }
}
