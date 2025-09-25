"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, AlertCircle, Info, HelpCircle, Clock } from "lucide-react";
import { AccessibleLoading } from "./accessibility";
import { useAccessibilityAnnouncements } from "@/hooks/use-accessibility";

// Enhanced error display with cognitive accessibility features
interface CognitiveErrorProps {
  title: string;
  message: string;
  suggestion?: string;
  recoverable?: boolean;
  onRetry?: () => void;
  onHelp?: () => void;
  severity?: "error" | "warning" | "info";
  className?: string;
}

export function CognitiveError({
  title,
  message,
  suggestion,
  recoverable = false,
  onRetry,
  onHelp,
  severity = "error",
  className,
}: CognitiveErrorProps) {
  const { announceError } = useAccessibilityAnnouncements();
  const errorId = React.useId();
  const suggestionId = React.useId();

  React.useEffect(() => {
    announceError(`${title}: ${message}${suggestion ? `. ${suggestion}` : ""}`);
  }, [title, message, suggestion, announceError]);

  const icons = {
    error: AlertCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    error: "border-destructive/50 bg-destructive/5 text-destructive",
    warning: "border-orange-500/50 bg-orange-50/50 text-orange-700",
    info: "border-blue-500/50 bg-blue-50/50 text-blue-700",
  };

  const Icon = icons[severity];

  return (
    <div
      className={cn(
        "p-6 border rounded-lg",
        colors[severity],
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-labelledby={`${errorId}-title`}
      aria-describedby={suggestion ? `${errorId}-message ${suggestionId}` : `${errorId}-message`}
    >
      <div className="flex items-start space-x-3">
        <Icon
          className="h-6 w-6 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          role="img"
          focusable="false"
        />
        <div className="flex-1 space-y-3">
          <div>
            <h3
              id={`${errorId}-title`}
              className="font-semibold text-lg"
              role="heading"
              aria-level={2}
            >
              {title}
            </h3>
            <p
              id={`${errorId}-message`}
              className="text-sm mt-1 leading-relaxed"
            >
              {message}
            </p>
          </div>

          {suggestion && (
            <div
              id={suggestionId}
              className="p-3 bg-background/50 rounded-md border border-current/20"
              role="note"
              aria-label="Suggestion"
            >
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Suggestion:</p>
                  <p className="text-sm mt-1">{suggestion}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            {recoverable && onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${errorId}-retry-desc`}
              >
                Try Again
                <span id={`${errorId}-retry-desc`} className="sr-only">
                  Retry the failed operation
                </span>
              </button>
            )}

            {onHelp && (
              <button
                onClick={onHelp}
                className="px-4 py-2 bg-background border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px] flex items-center gap-2"
                aria-describedby={`${errorId}-help-desc`}
              >
                <HelpCircle className="h-4 w-4" aria-hidden="true" />
                Get Help
                <span id={`${errorId}-help-desc`} className="sr-only">
                  Open help documentation for this issue
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Success message with clear confirmation
interface CognitiveSuccessProps {
  title: string;
  message: string;
  nextSteps?: string[];
  onContinue?: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export function CognitiveSuccess({
  title,
  message,
  nextSteps,
  onContinue,
  onViewDetails,
  className,
}: CognitiveSuccessProps) {
  const { announceSuccess } = useAccessibilityAnnouncements();
  const successId = React.useId();

  React.useEffect(() => {
    announceSuccess(`${title}: ${message}`);
  }, [title, message, announceSuccess]);

  return (
    <div
      className={cn(
        "p-6 border border-green-200 bg-green-50/50 rounded-lg",
        className
      )}
      role="status"
      aria-live="polite"
      aria-labelledby={`${successId}-title`}
      aria-describedby={`${successId}-message`}
    >
      <div className="flex items-start space-x-3">
        <CheckCircle
          className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5"
          aria-hidden="true"
          role="img"
          focusable="false"
        />
        <div className="flex-1 space-y-3">
          <div>
            <h3
              id={`${successId}-title`}
              className="font-semibold text-lg text-green-800"
              role="heading"
              aria-level={2}
            >
              {title}
            </h3>
            <p
              id={`${successId}-message`}
              className="text-sm mt-1 text-green-700 leading-relaxed"
            >
              {message}
            </p>
          </div>

          {nextSteps && nextSteps.length > 0 && (
            <div
              className="p-3 bg-background/50 rounded-md border border-green-200/50"
              role="region"
              aria-label="Next steps"
            >
              <h4 className="text-sm font-medium text-green-800 mb-2">What's next:</h4>
              <ul
                className="text-sm text-green-700 space-y-1"
                role="list"
              >
                {nextSteps.map((step, index) => (
                  <li key={index} role="listitem" className="flex items-start gap-2">
                    <span className="text-green-600 font-bold mt-0.5" aria-hidden="true">
                      {index + 1}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            {onContinue && (
              <button
                onClick={onContinue}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${successId}-continue-desc`}
              >
                Continue
                <span id={`${successId}-continue-desc`} className="sr-only">
                  Proceed to the next step
                </span>
              </button>
            )}

            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="px-4 py-2 bg-background border border-green-300 text-green-700 rounded-md text-sm font-medium hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${successId}-details-desc`}
              >
                View Details
                <span id={`${successId}-details-desc`} className="sr-only">
                  View detailed information about this success
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress indicator with clear status and time estimates
interface CognitiveProgressProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  stepName?: string;
  estimatedTime?: string;
  showProgress?: boolean;
  className?: string;
}

export function CognitiveProgress({
  title,
  description,
  currentStep,
  totalSteps,
  stepName,
  estimatedTime,
  showProgress = true,
  className,
}: CognitiveProgressProps) {
  const progressId = React.useId();
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div
      className={cn(
        "p-6 border border-blue-200 bg-blue-50/50 rounded-lg",
        className
      )}
      role="status"
      aria-live="polite"
      aria-labelledby={`${progressId}-title`}
      aria-describedby={`${progressId}-description`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <AccessibleLoading
            message=""
            size="md"
            className="text-blue-600"
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <h3
              id={`${progressId}-title`}
              className="font-semibold text-lg text-blue-800"
              role="heading"
              aria-level={2}
            >
              {title}
            </h3>
            {description && (
              <p
                id={`${progressId}-description`}
                className="text-sm mt-1 text-blue-700 leading-relaxed"
              >
                {description}
              </p>
            )}
          </div>

          {showProgress && (
            <div
              className="space-y-2"
              role="progressbar"
              aria-valuenow={currentStep}
              aria-valuemin={1}
              aria-valuemax={totalSteps}
              aria-valuetext={`Step ${currentStep} of ${totalSteps}${stepName ? `: ${stepName}` : ""}`}
            >
              <div className="flex items-center justify-between text-sm text-blue-700">
                <span>
                  Step {currentStep} of {totalSteps}
                  {stepName && `: ${stepName}`}
                </span>
                <span className="font-medium">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )}

          {estimatedTime && (
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Estimated time remaining: {estimatedTime}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Timeout warning with clear actions
interface CognitiveTimeoutProps {
  title: string;
  message: string;
  timeRemaining: number; // in seconds
  onExtend?: () => void;
  onSave?: () => void;
  onContinue?: () => void;
  className?: string;
}

export function CognitiveTimeout({
  title,
  message,
  timeRemaining,
  onExtend,
  onSave,
  onContinue,
  className,
}: CognitiveTimeoutProps) {
  const [remaining, setRemaining] = React.useState(timeRemaining);
  const { announceError } = useAccessibilityAnnouncements();
  const timeoutId = React.useId();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          announceError("Session timeout reached");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [announceError]);

  // Announce warnings at key intervals
  React.useEffect(() => {
    if (remaining === 60) {
      announceError("Session will timeout in 1 minute");
    } else if (remaining === 30) {
      announceError("Session will timeout in 30 seconds");
    } else if (remaining === 10) {
      announceError("Session will timeout in 10 seconds");
    }
  }, [remaining, announceError]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`;
  };

  return (
    <div
      className={cn(
        "p-6 border border-orange-200 bg-orange-50/50 rounded-lg",
        remaining <= 30 && "border-red-200 bg-red-50/50",
        className
      )}
      role="alert"
      aria-live="assertive"
      aria-labelledby={`${timeoutId}-title`}
      aria-describedby={`${timeoutId}-message`}
    >
      <div className="flex items-start space-x-3">
        <Clock
          className={cn(
            "h-6 w-6 flex-shrink-0 mt-0.5",
            remaining <= 30 ? "text-red-500" : "text-orange-500"
          )}
          aria-hidden="true"
          role="img"
          focusable="false"
        />
        <div className="flex-1 space-y-3">
          <div>
            <h3
              id={`${timeoutId}-title`}
              className={cn(
                "font-semibold text-lg",
                remaining <= 30 ? "text-red-800" : "text-orange-800"
              )}
              role="heading"
              aria-level={2}
            >
              {title}
            </h3>
            <p
              id={`${timeoutId}-message`}
              className={cn(
                "text-sm mt-1 leading-relaxed",
                remaining <= 30 ? "text-red-700" : "text-orange-700"
              )}
            >
              {message}
            </p>
          </div>

          <div
            className={cn(
              "p-3 rounded-md border text-center",
              remaining <= 30
                ? "bg-red-100/50 border-red-200"
                : "bg-orange-100/50 border-orange-200"
            )}
            role="timer"
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className={cn(
                "text-2xl font-bold tabular-nums",
                remaining <= 30 ? "text-red-800" : "text-orange-800"
              )}
            >
              {formatTime(remaining)}
            </div>
            <div
              className={cn(
                "text-sm",
                remaining <= 30 ? "text-red-600" : "text-orange-600"
              )}
            >
              remaining
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onExtend && (
              <button
                onClick={onExtend}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${timeoutId}-extend-desc`}
              >
                Extend Session
                <span id={`${timeoutId}-extend-desc`} className="sr-only">
                  Extend your current session to continue working
                </span>
              </button>
            )}

            {onSave && (
              <button
                onClick={onSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${timeoutId}-save-desc`}
              >
                Save Progress
                <span id={`${timeoutId}-save-desc`} className="sr-only">
                  Save your current progress before session expires
                </span>
              </button>
            )}

            {onContinue && (
              <button
                onClick={onContinue}
                className="px-4 py-2 bg-background border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
                aria-describedby={`${timeoutId}-continue-desc`}
              >
                Continue Without Saving
                <span id={`${timeoutId}-continue-desc`} className="sr-only">
                  Continue without saving changes. Changes may be lost.
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirmation dialog with clear consequences
interface CognitiveConfirmationProps {
  title: string;
  message: string;
  consequences?: string[];
  confirmText?: string;
  cancelText?: string;
  severity?: "normal" | "warning" | "destructive";
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
}

export function CognitiveConfirmation({
  title,
  message,
  consequences,
  confirmText = "Confirm",
  cancelText = "Cancel",
  severity = "normal",
  onConfirm,
  onCancel,
  className,
}: CognitiveConfirmationProps) {
  const confirmationId = React.useId();

  const severityStyles = {
    normal: "border-blue-200 bg-blue-50/50",
    warning: "border-orange-200 bg-orange-50/50",
    destructive: "border-red-200 bg-red-50/50",
  };

  const buttonStyles = {
    normal: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    warning: "bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500",
    destructive: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <div
      className={cn(
        "p-6 border rounded-lg",
        severityStyles[severity],
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${confirmationId}-title`}
      aria-describedby={`${confirmationId}-message`}
    >
      <div className="space-y-4">
        <div>
          <h3
            id={`${confirmationId}-title`}
            className="font-semibold text-lg text-foreground"
            role="heading"
            aria-level={2}
          >
            {title}
          </h3>
          <p
            id={`${confirmationId}-message`}
            className="text-sm mt-2 text-muted-foreground leading-relaxed"
          >
            {message}
          </p>
        </div>

        {consequences && consequences.length > 0 && (
          <div
            className="p-3 bg-background/50 rounded-md border border-current/20"
            role="region"
            aria-label="Consequences of this action"
          >
            <h4 className="text-sm font-medium text-foreground mb-2">
              This action will:
            </h4>
            <ul
              className="text-sm text-muted-foreground space-y-1"
              role="list"
            >
              {consequences.map((consequence, index) => (
                <li key={index} role="listitem" className="flex items-start gap-2">
                  <span className="text-foreground font-bold mt-0.5" aria-hidden="true">
                    •
                  </span>
                  <span>{consequence}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-background border border-border text-foreground rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-[44px]",
              buttonStyles[severity]
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}