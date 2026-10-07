export function validateAgent(values) {
  const errors = {};
  const fullName = values.fullName.trim();
  const phone = values.phone.trim().replace(/[ -]/g, "");
  const email = values.email.trim();
  const serviceArea = values.serviceArea.trim();

  if (fullName.length < 2 || fullName.length > 120) {
    errors.fullName = "Enter a name between 2 and 120 characters.";
  }
  if (!/^\+?[0-9]{10,15}$/.test(phone)) {
    errors.phone = "Enter 10–15 digits with an optional leading +.";
  }
  if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address (maximum 255 characters).";
  }
  if (serviceArea.length < 2 || serviceArea.length > 120) {
    errors.serviceArea = "Enter a service area between 2 and 120 characters.";
  }
  if (!["active", "inactive"].includes(values.status)) {
    errors.status = "Choose active or inactive.";
  }
  return errors;
}
