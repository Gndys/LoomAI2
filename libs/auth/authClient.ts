import { createAuthClient as createAuthClientVue } from "better-auth/vue"
import { createAuthClient as createAuthClientReact } from "better-auth/react"

export const authClientVue = createAuthClientVue({
  baseURL: 'http://localhost:3000',
})

export const authClientReact = createAuthClientReact({
  baseURL: 'http://localhost:3000',
})
