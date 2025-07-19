type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast(options: ToastOptions) {
  // Minimal implementation: logs to console
  // Replace with your app's toast/notification system as needed
  const prefix = options.variant === "destructive" ? "[ERROR]" : "[INFO]";
  console.log(
    `${prefix} ${options.title ? options.title + ": " : ""}${options.description ?? ""}`
  );
}
