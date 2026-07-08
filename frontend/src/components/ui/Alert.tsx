import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { ReactNode } from "react";

type AlertVariant = "warning" | "danger" | "info" | "success";

const variantStyles: Record<AlertVariant, { container: string; icon: string }> = {
  warning: { container: "border-warning/30 bg-warning/10 text-warning", icon: "text-warning" },
  danger: { container: "border-danger/30 bg-danger/10 text-danger", icon: "text-danger" },
  info: { container: "border-brand/30 bg-brand/10 text-brand-strong", icon: "text-brand" },
  success: { container: "border-positive/30 bg-positive/10 text-positive", icon: "text-positive" },
};

const variantIcons: Record<AlertVariant, typeof AlertTriangle> = {
  warning: AlertTriangle,
  danger: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

interface AlertProps {
  variant?: AlertVariant;
  title: string;
  children?: ReactNode;
}

export function Alert({ variant = "info", title, children }: AlertProps) {
  const Icon = variantIcons[variant];
  const styles = variantStyles[variant];

  return (
    <div className={`flex gap-3 rounded-xl border px-4 py-3 text-sm ${styles.container}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`} aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-foreground">{title}</p>
        {children && <div className="text-muted">{children}</div>}
      </div>
    </div>
  );
}
