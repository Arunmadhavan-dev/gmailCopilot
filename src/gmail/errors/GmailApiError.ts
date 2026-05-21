/**
 * Custom error class for Gmail API failures
 */
export class GmailApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "GmailApiError";
    this.status = status;
  }
}
