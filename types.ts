export interface StoryCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  fullContent: string;
  image: string;
  coordinates: string;
  type: 'product' | 'ethos' | 'process';
}

export interface GeometryState {
  mouseX: number;
  mouseY: number;
  isExpanded: boolean;
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}