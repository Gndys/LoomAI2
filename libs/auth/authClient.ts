import { createAuthClient as createAuthClientVue } from "better-auth/vue"
import { createAuthClient as createAuthClientReact } from "better-auth/react"
import { genericOAuthClient } from "better-auth/client/plugins"


export const authClientVue = createAuthClientVue({
  baseURL: 'http://localhost:3000',
  plugins: [
    genericOAuthClient()
  ]
})

export const authClientReact = createAuthClientReact({
  baseURL: 'http://localhost:3000',
  plugins: [
    genericOAuthClient()
  ]
})
