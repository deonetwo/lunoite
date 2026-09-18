export type CardCategory = 'star' | 'snippet' | 'template' | 'note';

export interface ReferenceCard {
  id: string;
  title: string;
  category: CardCategory;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}
