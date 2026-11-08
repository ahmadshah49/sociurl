import { useState } from "react";
import { SocialInput } from "sociurl/react";
import type { ValidationResult } from "sociurl";

export function ProfileForm() {
  const [instagram, setInstagram] = useState("");
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        console.log({ instagram, validation });
      }}
    >
      <SocialInput
        platform="instagram"
        label="Instagram profile"
        placeholder="https://instagram.com/username"
        value={instagram}
        onChange={setInstagram}
        onValidationChange={setValidation}
      />

      <button type="submit" disabled={!validation?.valid}>
        Save
      </button>
    </form>
  );
}
