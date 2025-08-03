import { AppError } from "./AppError";

export class NoEnoughStockError extends AppError {
  constructor(message = "Validation failed") {
    super(message, 400, "NoEnoughStockError");
  }
}
