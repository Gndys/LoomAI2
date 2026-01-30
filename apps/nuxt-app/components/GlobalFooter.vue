<template>
  <footer class="mt-20 bg-background/90">
    <div class="container px-4 sm:px-6 lg:px-8 py-16">
      <div class="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div class="space-y-5">
          <AppLogo size="md" />
          <p class="text-base text-muted-foreground leading-relaxed max-w-md">
            {{ t('footer.description') }}
          </p>
        </div>
        <div class="grid gap-10 sm:grid-cols-2 lg:col-span-2">
          <div class="space-y-4">
            <p class="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {{ t('footer.sections.about.title') }}
            </p>
            <div class="flex flex-col gap-3">
              <NuxtLink :to="localePath('/ai')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.about.links.demos') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/pricing')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.about.links.pricing') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/premium-features')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.about.links.premium') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/new-features')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.about.links.updates') }}
              </NuxtLink>
            </div>
          </div>
          <div class="space-y-4">
            <p class="text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              {{ t('footer.sections.tools.title') }}
            </p>
            <div class="flex flex-col gap-3">
              <NuxtLink :to="localePath('/ai-image-tools')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.tools.links.aiImageTools') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/image-generate')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.tools.links.aiImage') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/clothes-split')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.tools.links.clothesSplit') }}
              </NuxtLink>
              <NuxtLink :to="localePath('/clothes-sketch')" class="text-base text-muted-foreground hover:text-foreground transition-colors">
                {{ t('footer.sections.tools.links.clothesSketch') }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
      <div class="mt-12 border-t border-border/40 pt-6 text-sm text-muted-foreground">
        {{ t('footer.copyright', { year }) }}
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import AppLogo from '@/components/AppLogo.vue'

const { t } = useI18n()
const localePath = useLocalePath()
const year = new Date().getFullYear()
</script>
