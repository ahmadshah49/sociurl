import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SocialInput } from "../../src/react";
import type { ValidationResult } from "../../src";

function ControlledInput({
  onChange,
  onValidationChange,
}: {
  onChange?: (value: string) => void;
  onValidationChange?: (result: ValidationResult | null) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <SocialInput
      platform="instagram"
      label="Instagram profile"
      value={value}
      onChange={(nextValue) => {
        setValue(nextValue);
        onChange?.(nextValue);
      }}
      onValidationChange={onValidationChange}
    />
  );
}

describe("SocialInput", () => {
  it("renders an accessible labeled input", () => {
    render(<SocialInput platform="instagram" label="Instagram profile" />);
    const input = screen.getByLabelText("Instagram profile");

    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAccessibleName("Instagram profile");
    expect(document.querySelector("svg")).not.toBeNull();
  });

  it("uses a fallback accessible label when no label is provided", () => {
    render(<SocialInput platform="github" />);
    expect(screen.getByLabelText("GitHub profile URL")).toBeInTheDocument();
  });

  it("supports controlled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ControlledInput onChange={onChange} />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "instagram.com/ahmad");

    expect(onChange).toHaveBeenLastCalledWith("instagram.com/ahmad");
    expect(input).toHaveValue("instagram.com/ahmad");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("supports uncontrolled mode", async () => {
    const user = userEvent.setup();

    render(<SocialInput platform="instagram" label="Instagram profile" defaultValue="" />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "instagram.com/ahmad");
    expect(input).toHaveValue("instagram.com/ahmad");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("shows a live validation error", async () => {
    const user = userEvent.setup();
    render(<SocialInput platform="instagram" label="Instagram profile" />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "https://instagram.com/");
    const error = await screen.findByRole("alert");

    expect(error).toHaveTextContent("Instagram username is missing");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("clears the error when the value becomes valid", async () => {
    const user = userEvent.setup();
    render(<SocialInput platform="instagram" label="Instagram profile" />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "https://instagram.com/");
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    await user.type(input, "ahmad");
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("can defer validation until blur", async () => {
    const user = userEvent.setup();
    render(<SocialInput platform="instagram" label="Instagram profile" validateOn="blur" />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "https://instagram.com/");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.tab();
    expect(await screen.findByRole("alert")).toHaveTextContent("Instagram username is missing");
  });

  it("reports validation changes", async () => {
    const user = userEvent.setup();
    const onValidationChange = vi.fn();
    render(<ControlledInput onValidationChange={onValidationChange} />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "instagram.com/ahmad");

    await waitFor(() =>
      expect(onValidationChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          valid: true,
          platform: "instagram",
          username: "ahmad",
          normalizedUrl: "https://www.instagram.com/ahmad",
        }),
      ),
    );
  });

  it("rejects a profile from another platform", async () => {
    const user = userEvent.setup();
    render(<SocialInput platform="instagram" label="Instagram profile" />);
    const input = screen.getByLabelText("Instagram profile");

    await user.type(input, "https://github.com/ahmad");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Expected a profile URL for Instagram",
    );
  });

  it("supports disabled and read-only states", () => {
    const { rerender } = render(
      <SocialInput platform="instagram" label="Instagram profile" disabled />,
    );
    expect(screen.getByLabelText("Instagram profile")).toBeDisabled();

    rerender(<SocialInput platform="instagram" label="Instagram profile" readOnly />);
    expect(screen.getByLabelText("Instagram profile")).toHaveAttribute("readonly");
  });

  it("exposes custom class names", () => {
    const { container } = render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        containerClassName="container-class"
        labelClassName="label-class"
        fieldClassName="field-class"
        iconClassName="icon-class"
        errorClassName="error-class"
        className="input-class"
      />,
    );

    expect(container.firstElementChild).toHaveClass("container-class");
    expect(screen.getByText("Instagram profile")).toHaveClass("label-class");
    expect(container.querySelector(".field-class")).not.toBeNull();
    expect(container.querySelector(".icon-class")).not.toBeNull();
    expect(screen.getByLabelText("Instagram profile")).toHaveClass("input-class");
  });

  it("supports custom error rendering", async () => {
    const user = userEvent.setup();
    render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        renderError={(error) => <em data-testid="custom-error">{error.code}</em>}
      />,
    );

    await user.type(screen.getByLabelText("Instagram profile"), "https://instagram.com/");
    expect(await screen.findByTestId("custom-error")).toHaveTextContent("MISSING_USERNAME");
  });

  it("can hide the error and icon", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        showError={false}
        showIcon={false}
      />,
    );

    expect(container.querySelector("svg")).toBeNull();
    await user.type(screen.getByLabelText("Instagram profile"), "https://instagram.com/");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("does not render an icon for an unknown platform", () => {
    const { container } = render(<SocialInput platform="unknown" />);
    expect(container.querySelector("svg")).toBeNull();
    expect(screen.getByLabelText("Social profile URL")).toBeInTheDocument();
  });

  it("renders a monochrome icon by default", () => {
    const { container } = render(<SocialInput platform="instagram" label="Instagram profile" />);
    expect(container.querySelector("svg")).toHaveAttribute("fill", "currentColor");
  });

  it("renders a brand-colored icon with colorStyle", () => {
    const { container } = render(
      <SocialInput platform="instagram" label="Instagram profile" colorStyle="brand" />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("fill", "#E4405F");
  });

  it("lets iconColor override the brand color", () => {
    const { container } = render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        colorStyle="brand"
        iconColor="#111827"
      />,
    );
    expect(container.querySelector("svg")).toHaveAttribute("fill", "#111827");
  });

  it("renders overridden validation messages", async () => {
    const user = userEvent.setup();
    render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        messages={{ MISSING_USERNAME: "Add your Instagram handle" }}
      />,
    );

    await user.type(screen.getByLabelText("Instagram profile"), "https://instagram.com/");
    expect(await screen.findByRole("alert")).toHaveTextContent("Add your Instagram handle");
  });

  it("supports function-based message overrides", async () => {
    const user = userEvent.setup();
    render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        messages={{ MISSING_USERNAME: ({ platform }) => `Missing ${platform?.name} user` }}
      />,
    );

    await user.type(screen.getByLabelText("Instagram profile"), "https://instagram.com/");
    expect(await screen.findByRole("alert")).toHaveTextContent("Missing Instagram user");
  });

  it("applies inline styles to every rendered part", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        containerStyle={{ padding: "7px" }}
        labelStyle={{ color: "red" }}
        fieldStyle={{ display: "flex" }}
        iconStyle={{ opacity: 0.5 }}
        errorStyle={{ color: "crimson" }}
        style={{ borderWidth: "3px" }}
      />,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.padding).toBe("7px");
    expect(screen.getByText("Instagram profile").style.color).toBe("red");
    expect(container.querySelector("svg")?.style.opacity).toBe("0.5");
    expect(screen.getByLabelText("Instagram profile").style.borderWidth).toBe("3px");

    await user.type(screen.getByLabelText("Instagram profile"), "https://instagram.com/");
    expect((await screen.findByRole("alert")).style.color).toBe("crimson");
  });
});
