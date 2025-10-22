import logo from "@/assets/logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

const Logo = ({ size = "lg", showText = true, className = "" }: LogoProps) => {
  const sizeClasses = {
    sm: {
      image: "w-6 h-6",
      text: "text-lg",
      gap: "gap-2",
      margin: "mb-0",
    },
    md: {
      image: "w-8 h-8",
      text: "text-xl",
      gap: "gap-2",
      margin: "mb-0",
    },
    lg: {
      image: "w-14 h-14",
      text: "text-5xl",
      gap: "gap-3",
      margin: "mb-8",
    },
    xl: {
      image: "w-20 h-20",
      text: "text-6xl",
      gap: "gap-4",
      margin: "mb-8",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div
      className={`flex items-center ${currentSize.gap} ${currentSize.margin} ${className}`}
    >
      <img
        src={logo}
        alt="GlobalPay Logo"
        className={`${currentSize.image} object-contain`}
      />
      {showText && (
        <span className={`${currentSize.text} font-light text-gray-900`}>
          globalpay
        </span>
      )}
    </div>
  );
};

export default Logo;
