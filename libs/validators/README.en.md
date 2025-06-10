# Validators System

ShipEasy's data validation system built on Zod, providing type-safe data validation and form handling capabilities.

## 🎯 Design Goals

- **Type Safety**: Use TypeScript and Zod to ensure compile-time and runtime type safety
- **Simple & Intuitive**: Keep validation rules simple and easy to understand and maintain
- **Highly Reusable**: Support validator composition and extension to avoid code duplication
- **Form Integration**: Seamless integration with React Hook Form for excellent user experience
- **Internationalization**: Support multi-language error message display

## 📁 Directory Structure

```
libs/validators/
├── README.md          # Chinese documentation
├── README.en.md       # This document (English)
├── user.ts           # User-related validators
└── index.ts          # Unified exports (future planning)
```

## 🏗️ Core Architecture

### Validator Categories

Our validators are categorized by business scenarios:

1. **Base Validators** - Complete validation for database entities
2. **Form Validators** - Validation for specific form scenarios
3. **Operation Validators** - Validation for specific business operations
4. **Extended Validators** - Extensions and variants based on base validators

### Naming Conventions

- Base validators: `entitySchema` (e.g., `userSchema`)
- Form validators: `actionFormSchema` (e.g., `signupFormSchema`, `loginFormSchema`)
- Operation validators: `actionSchema` (e.g., `changePasswordSchema`, `resetPasswordSchema`)
- Extended validators: `baseEntityExtendedSchema` (e.g., `updateUserSchema`)

## 🔧 Usage

### 1. Integration with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "@libs/validators/user";
import type { z } from "zod";

type FormData = z.infer<typeof loginFormSchema>;

export function LoginForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(loginFormSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData) => {
    // Form submission logic
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

### 2. Direct Data Validation

```typescript
import { userSchema } from "@libs/validators/user";

// Safe parsing (recommended)
const result = userSchema.safeParse(data);
if (!result.success) {
  console.error('Validation failed:', result.error.issues);
  return;
}
// Use validated data: result.data
```

### 3. TypeScript Type Inference

```typescript
import type { z } from "zod";
import { userSchema } from "@libs/validators/user";

// Automatic type inference
type User = z.infer<typeof userSchema>;

function createUser(userData: User) {
  // userData has complete type hints
}
```

## 🎨 Best Practices

### Validator Design Principles

- **Single Responsibility**: Each validator focuses on specific use cases
- **Composition over Inheritance**: Use `.extend()` and `.partial()` to compose validators
- **Clear Error Messages**: Provide clear validation error messages
- **Performance Considerations**: Avoid complex validation logic, keep validators lightweight

### Form Validation Configuration

```typescript
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',              // Validate on blur
  reValidateMode: 'onChange',  // Re-validation mode
  defaultValues: { /* ... */ } // Provide default values
});
```

### Validator Extension

```typescript
// Create new validators based on existing ones
export const adminUserSchema = userSchema.extend({
  permissions: z.array(z.string()),
});

// Create optional field versions
export const partialUserSchema = userSchema.partial();

// Select specific fields
export const userProfileSchema = userSchema.pick({
  name: true,
  email: true,
  image: true,
});
```

## 🧪 Testing

Validators have complete test coverage located at `tests/unit/validators/user.test.ts`.

## 🔮 Future Plans

1. **More Validators**: Plan to add subscription, payment and other business-related validators
2. **Custom Validators**: Support more complex business rule validation
3. **Validator Tools**: Develop validator generation and testing tools

## 🤝 Contribution Guidelines

When adding new validators, please follow these steps:

1. Add new schemas to the appropriate validator file
2. Follow existing naming conventions
3. Add complete TypeScript type annotations
4. Write corresponding test cases
5. Update this README document

## 📚 Related Technologies

- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [React Hook Form](https://react-hook-form.com/) - High-performance form library
- [TypeScript](https://www.typescriptlang.org/) - Type safety 