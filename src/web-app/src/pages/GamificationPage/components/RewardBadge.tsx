import React from 'react';
import type { RewardItem } from "../../../domains/rewards/type.ts";
import { REWARDS_METADATA } from "../../../domains/rewards/rewardsConfig.ts";

interface RewardBadgeProps {
  item: RewardItem;
  index: number;
}

export default function RewardBadge({ item, index }: RewardBadgeProps) {
  const meta = REWARDS_METADATA[item.source] || REWARDS_METADATA['DEFAULT'];
  const { Icon, color, bgColor, label } = meta;

  return (
    <div
      className="reward-badge-card"
      style={{
        '--border-color': color,
        '--bg-color': bgColor,
        animationDelay: `${index * 0.1}s`
      } as React.CSSProperties}
    >
      <div className="badge-icon-wrapper">
        {Icon && <Icon size={32} color={color} strokeWidth={2} />}
      </div>
      <div className="badge-info">
        <h4>{label}</h4>
        <p>{item.description}</p>
        <span className="badge-points">+{item.points} балів</span>
      </div>
    </div>
  );
}
