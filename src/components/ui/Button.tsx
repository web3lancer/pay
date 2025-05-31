import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'outline' | 'ghost';
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
  const baseClasses = 'font-medium rounded-lg inline-flex items-center justify-center transition-colors';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-2.5',
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-800 hover:bg-neutral-200',
    primary: 'bg-cyan-500 text-white hover:bg-cyan-600',
    outline: 'bg-transparent border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;