interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner = ({ size = 'medium', color = 'purple-600' }: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-2',
    large: 'w-12 h-12 border-3',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-300 border-t-${color} animate-spin`}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 