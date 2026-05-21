import React from 'react';
import type {RewardItem} from "../../../domains/rewards/type.ts";
import {REWARDS_METADATA} from "../../../domains/rewards/rewardsConfig.ts";

interface RewardBadgeProps {
  item: RewardItem;
  index: number; // Для затримки анімації
}

export default function RewardBadge({ item, index }: RewardBadgeProps) {
  // Шукаємо метадані по source, якщо нема — беремо DEFAULT
  const meta = REWARDS_METADATA[item.source] || REWARDS_METADATA['DEFAULT'];
  const Icon = meta.icon;

  return (
    <div
      className={`reward-badge-card badge-${meta.badgeType}`}
      style={{
        '--border-color': meta.borderColor,
        '--bg-color': meta.bgColor,
        animationDelay: `${index * 0.1}s` // Каскадна анімація появи
      } as React.CSSProperties}
    >
      <div className="badge-icon-wrapper">
        <Icon size={32} color={meta.borderColor} strokeWidth={2} />
      </div>
      <div className="badge-info">
        <h4>{meta.label}</h4>
        <p>{item.description}</p>
        <span className="badge-points">+{item.points} балів</span>
      </div>
    </div>
  );
}
