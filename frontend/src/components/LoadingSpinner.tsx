import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export const LoadingSpinner = ({ size = "md", text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-blue-900/20 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-400 mx-auto`} />
        {text && (
          <p className="mt-4 text-gray-400 text-sm">{text}</p>
        )}
      </div>
    </div>
  );
};