export interface LoginRequest {
  userId: string;
  userPassword: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMinutes: number;
  userId: string;
  userType: string;
}

export interface MessageSearchRequest {
  startDate: string;
  endDate: string;
  status?: number;
  msgType?: number;
  recipient?: string;
  page?: number;
  size?: number;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface MessageResponse {
  msgId: number;
  subject: string;
  message: string;
  msgType: string;
  msgTypeNm: string;
  status: string;
  statusNm: string;
  scheduleTime: string;
  submitTime: string;
  callbackNum: string;
  rcptData: string;
  result: string;
  resultDesc: string;
}

export interface MessageSendRequest {
  msgType: number;
  callbackNum: string;
  rcptData: string;
  subject?: string;
  message: string;
  scheduleTime?: string;
}

export interface MessageSendResponse {
  msgId: number;
  msgType: number;
  rcptData: string;
  status: number;
  requestedAt: string;
  message: string;
}

export interface AgentProcessResponse {
  processedCount: number;
  message: string;
}
