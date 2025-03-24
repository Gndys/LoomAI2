<template>
  <div class="signin-container">
    <h2>Sign In</h2>
    <form @submit.prevent="handleSignIn" class="signin-form">
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
      <div class="form-group checkbox-group">
        <input
          type="checkbox"
          id="remember"
          v-model="form.remember"
        />
        <label for="remember">Remember Me</label>
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { authClientVue } from '@shipeasy/auth/authClient';

// 表单数据
const form = reactive({
  email: '',
  password: '',
  remember: false, // 添加 remember 属性
});

// 状态管理
const loading = ref(false);
const errorMessage = ref('');

// 提交处理函数
async function handleSignIn() {
  loading.value = true;
  errorMessage.value = '';

  try {
    const { data, error } = await authClientVue.signIn.email(
      {
        email: form.email,
        password: form.password,
        callbackURL: '/dashboard',
        // 如果 remember 为 true，可以添加额外的参数（视 better-auth 支持而定）
        ...(form.remember ? { rememberMe: true } : {}),
      },
      {
        onRequest: (ctx) => {
          console.log('Sign in request started');
        },
        onSuccess: (ctx) => {
          console.log('Sign in successful', ctx);
          navigateTo('/dashboard');
        },
        onError: (ctx) => {
          errorMessage.value = ctx.error.message;
          console.error('Sign in failed:', ctx.error.message);
        },
      }
    );
    console.log('Sign in response', data, error);
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
.signin-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.signin-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
}

.checkbox-group label {
  margin-bottom: 0;
  font-weight: normal;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

input[type="checkbox"] {
  width: 20px;
  height: 20px;
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