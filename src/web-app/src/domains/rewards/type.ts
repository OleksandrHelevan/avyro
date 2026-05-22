export interface RewardItem{
  _id: string;
  title: string;
  type: string;
  points: number;
  source: string;
  description: string;
  createdAt: string;
}

export type Reward= RewardItem[];
