import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'indigo' | 'outline' | 'ghost';
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  size = 'md',
  variant = 'default',
  icon,
  onClick,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  // Base classes
  const baseClasses =
    'font-medium rounded-xl inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-md';

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5',
  };

  // Variant classes
  const variantClasses = {
    default:
      'bg-white/60 text-neutral-800 hover:bg-white/80 shadow-md shadow-indigo-200/40',
    primary:
      'bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 text-white ' +
      'hover:from-cyan-600 hover:to-blue-700 ' +
      'shadow-lg shadow-cyan-500/40 ' +
      'border border-white/20 ' +
      'backdrop-blur-md glassmorphism-btn',
    indigo:
      'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white ' +
      'hover:from-indigo-600 hover:to-indigo-800 ' +
      'shadow-lg shadow-indigo-500/40 ' +
      'border border-white/20 ' +
      'backdrop-blur-md glassmorphism-btn',
    outline:
      'bg-white/30 border border-cyan-300 text-cyan-700 hover:bg-white/60 ' +
      'shadow-md shadow-indigo-200/30 backdrop-blur-md',
    ghost:
      'bg-transparent text-neutral-700 hover:bg-white/40 shadow-sm shadow-neutral-200/20 backdrop-blur-md',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={
        `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ` +
        `${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`
      }
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;