import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "custom";
  className?: string;
  customColor?: string; // Accepts any valid CSS color
};

const variantClasses = {
  primary: "bg-special-blue text-foreground hover:bg-cyan-700",
  secondary: "bg-special-black text-foreground hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700",
  custom: "", // Will be handled inline
};

export default function Button({
  variant = "primary",
  className = "",
  customColor,
  children,
  ...props
}: ButtonProps) {
  const style =
    variant === "custom" && customColor
      ? { backgroundColor: customColor, color: "#fff" }
      : undefined;

  return (
    <button
      className={`px-4 py-2 rounded transition-colors font-semibold ${variantClasses[variant]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
}
