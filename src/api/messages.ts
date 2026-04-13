import client from './client';
import type { MessageSearchRequest, MessageResponse, PagedResponse } from '../types';

export const searchMessages = async (request: MessageSearchRequest): Promise<PagedResponse<MessageResponse>> => {
  const { data } = await client.post<PagedResponse<MessageResponse>>('/api/messages/search', request);
  return data;
};
