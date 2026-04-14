import client from './client';
import type {
  MessageSearchRequest, MessageResponse, PagedResponse,
  MessageSendRequest, MessageSendResponse, AgentProcessResponse
} from '../types';

export const searchMessages = async (request: MessageSearchRequest): Promise<PagedResponse<MessageResponse>> => {
  const { data } = await client.post<PagedResponse<MessageResponse>>('/api/messages/search', request);
  return data;
};

export const sendMessage = async (request: MessageSendRequest): Promise<MessageSendResponse> => {
  const { data } = await client.post<MessageSendResponse>('/api/messages/send', request);
  return data;
};

export const processAgent = async (): Promise<AgentProcessResponse> => {
  const { data } = await client.post<AgentProcessResponse>('/api/agent/process');
  return data;
};

export const getPendingCount = async (): Promise<number> => {
  const { data } = await client.get<{ pendingCount: number }>('/api/agent/pending-count');
  return data.pendingCount;
};
