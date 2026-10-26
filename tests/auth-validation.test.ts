import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema matching the signup form requirements
const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  phone: z
    .string()
    .trim()
    .refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10;
    }, "Phone number must be at least 10 digits"),
  age: z
    .number()
    .int()
    .min(18, "Age must be at least 18")
    .max(99, "Age must be below 100"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

describe("Authentication & Signup Validation", () => {
  it("accepts a valid signup payload with name, email, phone, age, and password", () => {
    const validData = {
      name: "Aryan Sharma",
      email: "aryan@gmail.com",
      phone: "+91 98201 44821",
      age: 26,
      password: "securePassword123!",
    };
    const result = signupSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects names shorter than 2 characters", () => {
    const invalid = {
      name: "A",
      email: "a@gmail.com",
      phone: "9820144821",
      age: 25,
      password: "secretpassword",
    };
    const result = signupSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Name must be at least 2 characters");
    }
  });

  it("rejects invalid email formats", () => {
    const invalid = {
      name: "Aryan Sharma",
      email: "not-an-email",
      phone: "9820144821",
      age: 25,
      password: "secretpassword",
    };
    const result = signupSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates phone numbers with country code or 10 digits", () => {
    const valid1 = signupSchema.safeParse({
      name: "Rohit Verma",
      email: "rohit@bmyfit.in",
      phone: "9820144821",
      age: 30,
      password: "secretpassword",
    });
    expect(valid1.success).toBe(true);

    const valid2 = signupSchema.safeParse({
      name: "Rohit Verma",
      email: "rohit@bmyfit.in",
      phone: "+91 98201 44821",
      age: 30,
      password: "secretpassword",
    });
    expect(valid2.success).toBe(true);

    const invalid = signupSchema.safeParse({
      name: "Rohit Verma",
      email: "rohit@bmyfit.in",
      phone: "12345",
      age: 30,
      password: "secretpassword",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces age boundary: rejects below 18 and above 99", () => {
    const tooYoung = signupSchema.safeParse({
      name: "Minor User",
      email: "minor@bmyfit.in",
      phone: "9820144821",
      age: 16,
      password: "secretpassword",
    });
    expect(tooYoung.success).toBe(false);

    const validAge = signupSchema.safeParse({
      name: "Adult User",
      email: "adult@bmyfit.in",
      phone: "9820144821",
      age: 28,
      password: "secretpassword",
    });
    expect(validAge.success).toBe(true);

    const tooOld = signupSchema.safeParse({
      name: "Senior User",
      email: "senior@bmyfit.in",
      phone: "9820144821",
      age: 105,
      password: "secretpassword",
    });
    expect(tooOld.success).toBe(false);
  });

  it("enforces minimum password length of 6 characters", () => {
    const shortPass = signupSchema.safeParse({
      name: "Valid User",
      email: "valid@bmyfit.in",
      phone: "9820144821",
      age: 28,
      password: "123",
    });
    expect(shortPass.success).toBe(false);
  });
});
