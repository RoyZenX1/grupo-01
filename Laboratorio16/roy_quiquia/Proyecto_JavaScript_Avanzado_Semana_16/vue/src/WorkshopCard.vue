<script setup>
defineProps({ workshop: Object, disabled: Boolean });
const emit = defineEmits(['reserve']);
</script>
<template>
  <article class="tile">
    <h2>{{ workshop.title }}</h2>
    <p>{{ workshop.seats }} cupos disponibles</p>
    <button :disabled="disabled || workshop.seats === 0"
      @click="emit('reserve', workshop.id)">Reservar 1 cupo</button>
  </article>
</template>
