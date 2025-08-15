import React from "react";

interface AlertMessageProps {
  message: string | null;
  type: "success" | "error";
}

export default function AlertMessage({ message, type }: AlertMessageProps) {
  if (!message) return null;

  const classes =
    type === "error"
      ? "text-red-500 bg-red-100 border-red-400"
      : "text-green-600 bg-green-100 border-green-400";
  return (
    <div
      className={`p-4 border rounded-md text-center max-w-xl mx-auto mb-4 ${classes}`}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}
