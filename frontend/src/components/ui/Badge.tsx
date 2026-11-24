import React from 'react';

interface BadgeProps {
  label: string;
  variant?: 'green' | 'red' | 'yellow' | 'blue' | 'gray' | 'cyan';
  className?: string;
}

const variantClasses: Record<string, string> = {
  green: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  red: 'bg-red-500/20 text-red-400 border border-red-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  gray: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
};

export function Badge({ label, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {label}
    </span>
  );
}

interface TrustBadgeProps {
  trustLabel: string;
}

export function TrustBadge({ trustLabel }: TrustBadgeProps) {
  const variantMap: Record<string, BadgeProps['variant']> = {
    'Officially Sourced': 'green',
    'OFFICIALLY_SOURCED': 'green',
    'Verified Against Available Official Evidence': 'blue',
    'VERIFIED': 'blue',
    'Partially Verified': 'yellow',
    'PARTIALLY_VERIFIED': 'yellow',
    'Unverified': 'gray',
    'UNVERIFIED': 'gray',
    'Conflicting Information': 'red',
    'CONFLICTING': 'red',
  };
  return <Badge label={trustLabel} variant={variantMap[trustLabel] || 'gray'} />;
}

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const map: Record<string, BadgeProps['variant']> = {
    POTENTIALLY_ELIGIBLE: 'green',
    NOT_ELIGIBLE: 'red',
    ADDITIONAL_INFO_REQUIRED: 'yellow',
    UNABLE_TO_VERIFY: 'gray',
    VERIFIED: 'green',
    SUSPICIOUS: 'red',
    UNVERIFIED: 'gray',
  };
  const labels: Record<string, string> = {
    POTENTIALLY_ELIGIBLE: '✓ Potentially Eligible',
    NOT_ELIGIBLE: '✗ Not Eligible',
    ADDITIONAL_INFO_REQUIRED: '? More Info Needed',
    UNABLE_TO_VERIFY: '~ Unable to Verify',
    VERIFIED: '✓ Verified',
    SUSPICIOUS: '⚠ Suspicious',
    UNVERIFIED: '? Unverified',
  };
  return <Badge label={labels[status] || status} variant={map[status] || 'gray'} />;
}
