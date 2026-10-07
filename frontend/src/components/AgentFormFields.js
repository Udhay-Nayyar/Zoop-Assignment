import FormField from "./FormField";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../components/ui/select";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" }
];

export default function AgentFormFields({ values, errors, onChange, onBlur }) {
  return (
    <div className="form-grid">
      <FormField id="fullName" label="Full name" error={errors.fullName}>
        {(props) => <Input {...props} autoComplete="name" maxLength={120} name="fullName" onBlur={(event) => onBlur("fullName", event.target.value)} onChange={(event) => onChange("fullName", event.target.value)} value={values.fullName} />}
      </FormField>
      <FormField id="phone" label="Phone" error={errors.phone} hint="10–15 digits; spaces and dashes are allowed.">
        {(props) => <Input {...props} autoComplete="tel" inputMode="tel" name="phone" onBlur={(event) => onBlur("phone", event.target.value)} onChange={(event) => onChange("phone", event.target.value)} value={values.phone} />}
      </FormField>
      <FormField id="email" label="Email" error={errors.email}>
        {(props) => <Input {...props} autoComplete="email" maxLength={255} name="email" onBlur={(event) => onBlur("email", event.target.value)} onChange={(event) => onChange("email", event.target.value)} type="email" value={values.email} />}
      </FormField>
      <FormField id="serviceArea" label="Service area" error={errors.serviceArea}>
        {(props) => <Input {...props} autoComplete="address-level2" maxLength={120} name="serviceArea" onBlur={(event) => onBlur("serviceArea", event.target.value)} onChange={(event) => onChange("serviceArea", event.target.value)} value={values.serviceArea} />}
      </FormField>
      <FormField id="status" label="Status" error={errors.status}>
        {(props) => (
          <Select items={statusOptions} name="status" onValueChange={(value) => onChange("status", value)} value={values.status}>
            <SelectTrigger {...props} className="control-select-trigger" onBlur={() => onBlur("status", values.status)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        )}
      </FormField>
    </div>
  );
}
