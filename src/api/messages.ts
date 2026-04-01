import client from './client';
import type { MessageSearchRequest, MessageResponse } from '../types';

export const searchMessages = async (request: MessageSearchRequest): Promise<MessageResponse[]> => {
  const { data } = await client.post<MessageResponse[]>('/api/messages/search', request);
  return data;
};
