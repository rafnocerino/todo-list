export const MAX_TITLE_LENGTH = 200;

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}
