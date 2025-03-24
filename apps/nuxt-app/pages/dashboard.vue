<script setup lang="ts">
import { authClientVue } from "@shipeasy/auth/authClient"
 
const session = authClientVue.useSession() 
</script>
 
<template>
  <div>
      <div>
          <pre>{{ session.data }}</pre>
          <button v-if="session.data" @click="authClientVue.signOut()">
              Sign out
          </button>
      </div>
  </div>
</template>
