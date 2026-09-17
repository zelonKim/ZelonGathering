export interface ApiErrorRes {
  message: string | string[];
  statusCode?: number;
  error?: string;
}
