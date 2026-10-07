"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createAgent, updateAgent, ApiError } from "../lib/api";
import { validateAgent } from "../lib/validation";
import { useToast } from "./Toast";
import AgentFormFields from "./AgentFormFields";

const emptyValues = { fullName: "", phone: "", email: "", serviceArea: "", status: "active" };
const fields = ["fullName", "phone", "email", "serviceArea", "status"];

export default function AgentForm({ initialAgent, mode = "create" }) {
  const router = useRouter();
  const { showToast } = useToast();
  const initialValues = useMemo(() => initialAgent ? {
    fullName: initialAgent.fullName,
    phone: initialAgent.phone,
    email: initialAgent.email,
    serviceArea: initialAgent.serviceArea,
    status: initialAgent.status
  } : emptyValues, [initialAgent]);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const dirty = fields.some((field) => values[field] !== initialValues[field]);

  useEffect(() => {
    function warnBeforeLeave(event) {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    function confirmInternalNavigation(event) {
      if (!dirty || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.target === "_blank") return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (!window.confirm("You have unsaved changes. Leave this page?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", warnBeforeLeave);
    document.addEventListener("click", confirmInternalNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
      document.removeEventListener("click", confirmInternalNavigation, true);
    };
  }, [dirty]);

  function validateField(name, value) {
    const next = { ...values, [name]: value };
    const fieldErrors = validateAgent(next);
    setErrors((current) => ({ ...current, [name]: fieldErrors[name] }));
  }

  function change(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
    if (submitted) validateField(name, value);
    setFormError("");
  }

  function cancel() {
    if (!dirty || window.confirm("You have unsaved changes. Leave this page?")) {
      router.back();
    }
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    const validationErrors = validateAgent(values);
    setErrors(validationErrors);
    const firstInvalid = fields.find((field) => validationErrors[field]);
    if (firstInvalid) {
      formRef.current.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (mode === "edit" && !dirty) {
      setFormError("No changes to save");
      return;
    }

    setSaving(true);
    setFormError("");
    try {
      const data = Object.fromEntries(fields
        .filter((field) => mode === "create" || values[field] !== initialValues[field])
        .map((field) => [field, field === "email" ? values[field].trim().toLowerCase() : values[field].trim()]));
      const agent = mode === "create"
        ? await createAgent(data)
        : await updateAgent(initialAgent.id, data);
      showToast(mode === "create" ? "Agent created" : "Agent updated");
      router.push(`/agents/${agent.id}`);
    } catch (error) {
      if (error.name === "AbortError") return;
      if (error instanceof ApiError && error.status === 400) {
        const nextErrors = {};
        error.details.forEach(({ field, message }) => {
          if (fields.includes(field)) nextErrors[field] = message;
        });
        if (Object.keys(nextErrors).length) setErrors(nextErrors);
        else setFormError(error.message);
      } else if (error instanceof ApiError && error.status === 409) {
        const target = error.message.toLowerCase().includes("email")
          ? "email"
          : error.message.toLowerCase().includes("phone") ? "phone" : null;
        if (target) setErrors((current) => ({ ...current, [target]: error.message }));
        else setFormError(error.message);
      } else {
        setFormError(error.message || "Unable to save this agent.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form-card" onSubmit={submit} noValidate ref={formRef}>
      {formError && <p className="form-error-banner" role="alert">{formError}</p>}
      <AgentFormFields values={values} errors={errors} onChange={change} onBlur={validateField} />
      <div className="form-actions">
        <button className="button button-secondary" onClick={cancel} type="button">Cancel</button>
        <button className="button button-primary" disabled={saving} type="submit">{saving ? "Saving…" : mode === "create" ? "Create agent" : "Save changes"}</button>
      </div>
    </form>
  );
}
