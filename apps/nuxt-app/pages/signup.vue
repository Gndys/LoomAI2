<template>
  <div class="signup-container">
    <h2>Sign Up</h2>
    <form @submit.prevent="handleSignUp" class="signup-form">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          required
          placeholder="Enter your email"
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          required
          placeholder="Enter your password"
        />
      </div>
      <div class="form-group">
        <label for="name">Name</label>
        <input
          type="text"
          id="name"
          v-model="form.name"
          required
          placeholder="Enter your name"
        />
      </div>
      <div class="form-group">
        <label for="image">Profile Image URL (Optional)</label>
        <input
          type="url"
          id="image"
          v-model="form.image"
          placeholder="Enter image URL"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing Up...' : 'Sign Up' }}
      </button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { authClientVue } from "@shipeasy/auth/authClient"

// 表单数据
const form = reactive({
  email: '',
  password: '',
  name: '',
  image: ''
});

// 状态管理
const loading = ref(false);
const errorMessage = ref('');

// 提交处理函数
async function handleSignUp() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { data, error } = await authClientVue.signUp.email(
      {
        email: form.email,
        password: form.password,
        name: form.name,
        image: form.image || undefined, // 如果为空则传 undefined
        callbackURL: '/dashboard'
      },
      {
        onRequest: (ctx) => {
          console.log('Request started');
        },
        onSuccess: (ctx) => {
          console.log('Sign up successful', ctx);
          // 重定向到 dashboard（可以用 Nuxt 的 navigateTo）
          navigateTo('/dashboard');
        },
        onError: (ctx) => {
          errorMessage.value = ctx.error.message;
          console.error('Sign up failed:', ctx.error.message);
        }
      }
    );

    // 如果有错误，手动抛出（视 authClient 实现而定）
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    errorMessage.value = 'An unexpected error occurred';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.signup-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>