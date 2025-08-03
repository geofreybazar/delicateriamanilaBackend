import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, "NotFoundError");
  }
}
