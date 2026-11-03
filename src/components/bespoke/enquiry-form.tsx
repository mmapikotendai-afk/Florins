"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Copy, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { site } from "@/lib/config/site";
import {
  createBespokeEnquirySchema,
  enquiryDraft,
  studioToday,
  type BespokeEnquiry,
} from "@/lib/validations/bespoke";
import {
  inspectReferenceImage,
  referenceLimits,
} from "@/lib/validations/reference-images";

type Reference = { file: File; url: string; width: number; height: number };
const empty: BespokeEnquiry = {
  fullName: "",
  email: "",
  phone: "",
  occasion: "",
  preferredDate: "",
  eventDate: "",
  description: "",
  notes: "",
};
function subscribeToDay(notify: () => void) {
  const timer = window.setInterval(notify, 60_000);
  window.addEventListener("focus", notify);
  document.addEventListener("visibilitychange", notify);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", notify);
    document.removeEventListener("visibilitychange", notify);
  };
}
function Field({
  name,
  label,
  optional,
  error,
  hint,
  children,
}: {
  name: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="enquiry-field">
      <label htmlFor={name}>
        {label}
        {optional && <span> (optional)</span>}
      </label>
      {hint && (
        <p id={`${name}-help`} className="field-help">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p className="field-error" id={`${name}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function EnquiryForm() {
  const today = useSyncExternalStore(subscribeToDay, studioToday, () => "");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BespokeEnquiry>({
    resolver: zodResolver(createBespokeEnquirySchema(today || studioToday())),
    defaultValues: empty,
    mode: "onBlur",
    reValidateMode: "onChange",
  });
  const [references, setReferences] = useState<Reference[]>([]);
  const referenceRef = useRef<Reference[]>([]);
  const [referenceError, setReferenceError] = useState("");
  const [checkingImages, setCheckingImages] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("");
  const draftArea = useRef<HTMLTextAreaElement>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  useEffect(
    () => () => {
      referenceRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    },
    [],
  );
  function replaceReferences(next: Reference[]) {
    referenceRef.current = next;
    setReferences(next);
    setDraft(null);
    setCopyStatus("");
  }
  async function chooseImages(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setReferenceError("");
    setCheckingImages(true);
    setDraft(null);
    try {
      if (files.length + referenceRef.current.length > referenceLimits.count)
        throw new Error(
          "Choose no more than 3 reference images in total. Remove an image before adding another.",
        );
      const inspected = [];
      for (const file of files)
        inspected.push({ file, ...(await inspectReferenceImage(file)) });
      const next = inspected.map((item) => ({
        ...item,
        url: URL.createObjectURL(item.file),
      }));
      replaceReferences([...referenceRef.current, ...next]);
    } catch (error) {
      setReferenceError(
        `${error instanceof Error ? error.message : "This selection could not be opened."} This selection was not added.`,
      );
    } finally {
      input.value = "";
      setCheckingImages(false);
    }
  }
  function removeImage(index: number) {
    URL.revokeObjectURL(referenceRef.current[index].url);
    replaceReferences(
      referenceRef.current.filter((_, itemIndex) => itemIndex !== index),
    );
    setReferenceError("");
  }
  function prepare(value: BespokeEnquiry) {
    // Recheck against the current studio day if a tab was left open overnight.
    const parsed = createBespokeEnquirySchema().safeParse(value);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue, index) =>
        setError(
          issue.path[0] as keyof BespokeEnquiry,
          { type: "validate", message: issue.message },
          { shouldFocus: index === 0 },
        ),
      );
      return;
    }
    setDraft(
      enquiryDraft(
        parsed.data,
        references.map((item) => item.file.name),
      ),
    );
    setCopyStatus("");
    requestAnimationFrame(() => resultHeading.current?.focus());
  }
  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyStatus(
        "Copied. Open WhatsApp and paste the enquiry into your conversation with Florins.",
      );
    } catch {
      draftArea.current?.focus();
      draftArea.current?.select();
      setCopyStatus(
        "Select and copy the draft below, then paste it into your WhatsApp conversation.",
      );
    }
  }
  const a11y = (name: keyof BespokeEnquiry, hint = false) => ({
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby":
      [hint ? `${name}-help` : "", errors[name] ? `${name}-error` : ""]
        .filter(Boolean)
        .join(" ") || undefined,
  });
  return (
    <div className="enquiry-builder">
      <p className="enquiry-delivery">
        Prepare your enquiry here, then copy it into a WhatsApp message to
        Florins on <Link href={site.whatsapp}>{site.phoneDisplay}</Link>. This
        form does not send a message or confirm a booking. Reference images stay
        on your device.
      </p>
      <noscript>
        <p className="enquiry-notice">
          Enable JavaScript to prepare a draft, or contact{" "}
          <a href={site.whatsapp}>Florins on WhatsApp</a> directly. This form
          cannot send your information.
        </p>
      </noscript>
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(prepare, () => setDraft(null))(event);
        }}
        onChange={() => {
          setDraft(null);
          setCopyStatus("");
        }}
      >
        {Object.keys(errors).length > 0 && (
          <p className="enquiry-error-summary" role="alert">
            Please review the fields marked below. Your enquiry has not been
            sent.
          </p>
        )}
        <fieldset>
          <legend>Your details</legend>
          <div className="enquiry-fields">
            <Field
              name="fullName"
              label="Full name"
              error={errors.fullName?.message}
            >
              <Input
                id="fullName"
                autoComplete="name"
                required
                maxLength={100}
                {...register("fullName")}
                {...a11y("fullName")}
              />
            </Field>
            <Field name="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                maxLength={254}
                {...register("email")}
                {...a11y("email")}
              />
            </Field>
            <Field
              name="phone"
              label="Phone number"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                maxLength={32}
                {...register("phone")}
                {...a11y("phone")}
              />
            </Field>
            <Field
              name="occasion"
              label="Occasion"
              error={errors.occasion?.message}
            >
              <Input
                id="occasion"
                required
                maxLength={120}
                {...register("occasion")}
                {...a11y("occasion")}
              />
            </Field>
          </div>
        </fieldset>
        <fieldset>
          <legend>Your occasion &amp; design</legend>
          <div className="enquiry-fields">
            <Field
              name="preferredDate"
              label="Preferred appointment date"
              optional
              error={errors.preferredDate?.message}
              hint="A preferred date, subject to confirmation."
            >
              <Input
                id="preferredDate"
                type="date"
                min={today || undefined}
                {...register("preferredDate")}
                {...a11y("preferredDate", true)}
              />
            </Field>
            <Field
              name="eventDate"
              label="Event date"
              optional
              error={errors.eventDate?.message}
              hint="Leave blank if your date is still undecided."
            >
              <Input
                id="eventDate"
                type="date"
                min={today || undefined}
                {...register("eventDate")}
                {...a11y("eventDate", true)}
              />
            </Field>
          </div>
          <Field
            name="description"
            label="Design description"
            error={errors.description?.message}
            hint="Tell us about the silhouette, colours, details and feeling you have in mind. 20–3,000 characters."
          >
            <textarea
              id="description"
              rows={6}
              required
              maxLength={3000}
              {...register("description")}
              {...a11y("description", true)}
            />
          </Field>
          <Field
            name="references"
            label="Reference images"
            optional
            hint="Up to 3 JPEG, PNG or WebP images, 5 MB each and up to 20 megapixels. Local previews only; share the originals with the studio separately."
            error={referenceError}
          >
            <input
              id="references"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={checkingImages}
              onChange={chooseImages}
              aria-invalid={Boolean(referenceError)}
              aria-describedby={`references-help${referenceError ? " references-error" : ""}`}
            />
          </Field>
          {checkingImages && (
            <p role="status" className="field-help">
              Checking your images…
            </p>
          )}
          {references.length > 0 && (
            <ul
              className="reference-previews"
              aria-label="Selected reference images"
            >
              {references.map((item, index) => (
                <li key={item.url}>
                  <Image
                    src={item.url}
                    alt={`Your reference image: ${item.file.name}`}
                    width={96}
                    height={128}
                    unoptimized
                  />
                  <div>
                    <span>{item.file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      aria-label={`Remove ${item.file.name}`}
                    >
                      <X size={16} aria-hidden="true" /> Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Field
            name="notes"
            label="Additional notes"
            optional
            error={errors.notes?.message}
          >
            <textarea
              id="notes"
              rows={4}
              maxLength={1500}
              {...register("notes")}
              {...a11y("notes")}
            />
          </Field>
        </fieldset>
        <p className="enquiry-privacy">
          Your details are used only to build this draft in your browser.
          Nothing is submitted or saved by this form. Share the draft with
          Florins only when you are ready.
        </p>
        <Button
          type="submit"
          disabled={!today || checkingImages || isSubmitting}
        >
          Prepare enquiry <ArrowUpRight aria-hidden="true" />
        </Button>
      </form>
      {draft && (
        <section className="enquiry-result" aria-labelledby="draft-title">
          <h3 id="draft-title" ref={resultHeading} tabIndex={-1}>
            Your enquiry draft is ready.
          </h3>
          <p>
            Review your details below. Copy the text, open WhatsApp and paste it
            into your conversation with Florins on {site.phoneDisplay}. Nothing
            has been sent yet.
          </p>
          <label htmlFor="enquiry-draft">Enquiry draft</label>
          <textarea
            ref={draftArea}
            id="enquiry-draft"
            value={draft}
            readOnly
            rows={14}
          />
          <div className="enquiry-result-actions">
            <Button onClick={copyDraft}>
              <Copy aria-hidden="true" /> Copy enquiry
            </Button>
            <Button asChild variant="outline">
              <Link
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open WhatsApp in a new tab"
              >
                Open WhatsApp <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          {references.length > 0 && (
            <p>
              Images are not attached to this draft. Share your selected
              originals separately in the conversation.
            </p>
          )}
          <p role="status">{copyStatus}</p>
        </section>
      )}
    </div>
  );
}
