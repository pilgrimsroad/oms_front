export interface LoginRequest {
  userId: string;
  userPassword: string;
}

export interface LoginResponse {
  accessToken: string;
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
