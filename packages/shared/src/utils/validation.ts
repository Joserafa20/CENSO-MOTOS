export function validateColombianID(document: string): boolean {
  // Basic validation for Colombian ID (Cédula de Ciudadanía)
  if (!/^\d{6,12}$/.test(document)) return false;
  
  // Algorithm for validating Colombian CC (simplified)
  const digits = document.split('').map(Number);
  const checkDigit = digits.pop()!;
  
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let product = digits[i] * (i % 2 === 0 ? 2 : 1);
    if (product >= 10) product = product - 9;
    sum += product;
  }
  
  const calculatedCheck = (10 - (sum % 10)) % 10;
  return calculatedCheck === checkDigit;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Colombian phone format: +57 3XX XXX XXXX or 3XX XXX XXXX
  const phoneRegex = /^(\+57\s?)?(3\d{2}\s?\d{3}\s?\d{4}|\d{10})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePlate(plate: string): boolean {
  // Colombian plate format: ABC123 (old) or AAA123 (new)
  const plateRegex = /^[A-Z]{3}\d{3}$/;
  return plateRegex.test(plate.toUpperCase());
}

export function validatePlateNew(plate: string): boolean {
  // New Colombian plate format: AAA123
  const plateRegex = /^[A-Z]{3}\d{3}$/;
  return plateRegex.test(plate.toUpperCase());
}

export function isStrongPassword(password: string): boolean {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return password.length >= 8 && hasUpper && hasLower && hasNumber && hasSpecial;
}