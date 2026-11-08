import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, FocusEvent, InputHTMLAttributes, ReactNode } from "react";
import { getPlatformInfo } from "../../core/platform-info";
import type { PlatformRegistry } from "../../registry/platform-registry";
import type {
  PlatformId,
  ValidationError,
  ValidationMessages,
  ValidationResult,
} from "../../types";
import { useSocialValidator } from "../hooks/useSocialValidator";
import { SocialIcon } from "./SocialIcon";
import type { SocialIconColorStyle } from "./SocialIcon";

export interface SocialInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> {
  /** Constrains validation to this platform. */
  platform?: PlatformId;
  /** Controlled value. Omit to use uncontrolled mode with `defaultValue`. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** Called whenever the validation result changes (including `null` for empty input). */
  onValidationChange?: (result: ValidationResult | null) => void;
  /** Validate on every change (default) or wait for blur. */
  validateOn?: "change" | "blur";
  registry?: PlatformRegistry;
  /** Override error messages per error code. */
  messages?: ValidationMessages;
  /** Optional visible label. Without one, an accessible fallback label is used. */
  label?: ReactNode;
  /** Show the platform icon. Defaults to `true`. */
  showIcon?: boolean;
  /** Monochrome `currentColor` (default) or the platform's brand color. */
  colorStyle?: SocialIconColorStyle;
  /** Per-icon color override. Takes precedence over `colorStyle`. */
  iconColor?: string;
  showError?: boolean;
  iconSize?: number | string;
  containerClassName?: string;
  labelClassName?: string;
  fieldClassName?: string;
  iconClassName?: string;
  errorClassName?: string;
  containerStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  fieldStyle?: CSSProperties;
  iconStyle?: CSSProperties;
  errorStyle?: CSSProperties;
  /** Replace the default error element. */
  renderError?: (error: ValidationError) => ReactNode;
}

function joinClassNames(...values: Array<string | undefined>): string | undefined {
  const joined = values.filter(Boolean).join(" ");
  return joined || undefined;
}

/**
 * A platform-aware social profile input. It is intentionally unstyled and
 * exposes class names and native input props for full custom styling.
 */
export const SocialInput = forwardRef<HTMLInputElement, SocialInputProps>(
  function SocialInput(props, ref) {
    const {
      platform,
      registry,
      value,
      defaultValue,
      onChange,
      onValidationChange,
      validateOn = "change",
      messages,
      label,
      showIcon = true,
      colorStyle = "default",
      iconColor,
      showError = true,
      iconSize = 20,
      containerClassName,
      labelClassName,
      fieldClassName,
      iconClassName,
      errorClassName,
      containerStyle,
      labelStyle,
      fieldStyle,
      iconStyle,
      errorStyle,
      renderError,
      id,
      className,
      onBlur,
      disabled,
      readOnly,
      "aria-label": ariaLabelProp,
      "aria-describedby": describedByProp,
      "aria-invalid": ariaInvalidProp,
      ...inputProps
    } = props;

    const reactId = useId();
    const inputId = id ?? `sociurl-input-${reactId}`;
    const errorId = `${inputId}-error`;
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const currentValue = value ?? internalValue;
    const platformInfo = platform ? getPlatformInfo(platform, { registry }) : null;
    const { validateOnBlur, reset, result, error } = useSocialValidator({
      platform,
      registry,
      messages,
      value: currentValue,
      validateOn,
    });
    const lastNotified = useRef<ValidationResult | null>(null);

    useEffect(() => {
      if (lastNotified.current === result) {
        return;
      }

      lastNotified.current = result;
      onValidationChange?.(result);
    }, [onValidationChange, result]);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onChange?.(nextValue, event);

      if (validateOn === "blur") {
        reset();
      }
    };

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
      if (validateOn === "blur") {
        validateOnBlur(currentValue);
      }

      onBlur?.(event);
    };

    const accessibleLabel =
      label === undefined ? (platformInfo?.name ?? "Social") + " profile URL" : undefined;
    const resolvedAriaLabel = ariaLabelProp ?? accessibleLabel;
    const describedBy = error
      ? [describedByProp, errorId].filter(Boolean).join(" ")
      : describedByProp;

    return (
      <div
        className={containerClassName}
        style={containerStyle}
        data-platform={platform}
        data-valid={result ? String(result.valid) : undefined}
      >
        {label !== undefined ? (
          <label htmlFor={inputId} className={labelClassName} style={labelStyle}>
            {label}
          </label>
        ) : null}

        <div className={fieldClassName} style={fieldStyle}>
          {showIcon && platformInfo ? (
            <SocialIcon
              platform={platformInfo.id}
              registry={registry}
              size={iconSize}
              color={iconColor}
              colorStyle={colorStyle}
              className={iconClassName}
              style={iconStyle}
              decorative
            />
          ) : null}

          <input
            {...inputProps}
            ref={ref}
            id={inputId}
            type={inputProps.type ?? "text"}
            className={className}
            value={currentValue}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            aria-label={resolvedAriaLabel}
            aria-describedby={describedBy}
            aria-invalid={error ? true : ariaInvalidProp}
          />
        </div>

        {showError && error ? (
          <span
            id={errorId}
            className={joinClassNames("sociurl-input__error", errorClassName)}
            style={errorStyle}
            role="alert"
          >
            {renderError ? renderError(error) : error.message}
          </span>
        ) : null}
      </div>
    );
  },
);

SocialInput.displayName = "SocialInput";
