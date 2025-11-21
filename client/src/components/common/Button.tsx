import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' };

export default function Button({ children, variant = 'primary', ...rest }: Props) {
  const style = {
    padding: '8px 12px',
    background: variant === 'primary' ? '#2563eb' : '#e5e7eb',
    color: variant === 'primary' ? '#fff' : '#111',
    border: 'none',
    borderRadius: 4,
  } as React.CSSProperties;

  return (
    <button style={style} {...rest}>
      {children}
    </button>
  );
}
