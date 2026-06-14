<script setup lang="ts">
import { ref, provide } from 'vue'
import { RouterView } from 'vue-router'
import { TemplateGalleryModal } from '@/modules/templates'

const showModal = ref(false)
provide('openTemplateGallery', () => { showModal.value = true })
</script>

<template>
  <RouterView />
  <TemplateGalleryModal v-if="showModal" @close="showModal = false" />
</template>
