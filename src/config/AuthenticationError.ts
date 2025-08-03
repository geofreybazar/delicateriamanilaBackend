import { AppError } from "./AppError";

export class AuthenticationError extends AppError {
  constructor(message = "Invalid username or password") {
    super(message, 401, "AuthenticationError");
  }
}
