import FormField from "./FormField";

export default function AgentFormFields({ values, errors, onChange, onBlur }) {
  return (
    <div className="form-grid">
      <FormField id="fullName" label="Full name" error={errors.fullName}>
        {(props) => <input {...props} autoComplete="name" maxLength={120} name="fullName" onBlur={(event) => onBlur("fullName", event.target.value)} onChange={(event) => onChange("fullName", event.target.value)} value={values.fullName} />}
      </FormField>
      <FormField id="phone" label="Phone" error={errors.phone} hint="10–15 digits; spaces and dashes are allowed.">
        {(props) => <input {...props} autoComplete="tel" inputMode="tel" name="phone" onBlur={(event) => onBlur("phone", event.target.value)} onChange={(event) => onChange("phone", event.target.value)} value={values.phone} />}
      </FormField>
      <FormField id="email" label="Email" error={errors.email}>
        {(props) => <input {...props} autoComplete="email" maxLength={255} name="email" onBlur={(event) => onBlur("email", event.target.value)} onChange={(event) => onChange("email", event.target.value)} type="email" value={values.email} />}
      </FormField>
      <FormField id="serviceArea" label="Service area" error={errors.serviceArea}>
        {(props) => <input {...props} autoComplete="address-level2" maxLength={120} name="serviceArea" onBlur={(event) => onBlur("serviceArea", event.target.value)} onChange={(event) => onChange("serviceArea", event.target.value)} value={values.serviceArea} />}
      </FormField>
      <FormField id="status" label="Status" error={errors.status}>
        {(props) => <select {...props} name="status" onBlur={(event) => onBlur("status", event.target.value)} onChange={(event) => onChange("status", event.target.value)} value={values.status}><option value="active">Active</option><option value="inactive">Inactive</option></select>}
      </FormField>
    </div>
  );
}
