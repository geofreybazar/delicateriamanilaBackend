export class AppError extends Error {
  status: number;

  constructor(message: string, status: number, name = "AppError") {
    super(message);
    this.status = status;
    this.name = name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
