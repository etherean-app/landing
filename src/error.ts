export type ServerErrorJson = {
  title: string;
  status: number;
  detail: string;
};

export class ServerError extends Error {
  title: string;
  status: number;
  detail: string;

  constructor({ title, status, detail }: ServerErrorJson) {
    super();
    this.message = title;
    this.title = title;
    this.status = status;
    this.detail = detail;
  }
}
