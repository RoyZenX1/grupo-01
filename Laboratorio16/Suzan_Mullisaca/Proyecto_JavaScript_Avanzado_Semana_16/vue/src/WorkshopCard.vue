<script setup>
import { ref } from 'vue';

const props = defineProps({ workshop: Object, disabled: Boolean });
const emit = defineEmits(['reserve']);
const seats = ref(1);

function handleReserve() {
  const qty = Number(seats.value);
  if (!Number.isInteger(qty) || qty < 1 || qty > 4 || qty > props.workshop.seats) {
    return;
  }
  emit('reserve', { id: props.workshop.id, seats: qty });
}
</script>

<template>
  <article class="tile">
    <h2>{{ workshop.title }}</h2>
    <p>{{ workshop.seats }} cupos disponibles</p>
    <label>
      Cupos (1–4):
      <input
        type="number"
        v-model.number="seats"
        min="1"
        max="4"
        step="1"
        :disabled="disabled || workshop.seats === 0"
      />
    </label>
    <button
      :disabled="disabled || workshop.seats === 0 || !Number.isInteger(seats) || seats < 1 || seats > 4 || seats > workshop.seats"
      @click="handleReserve"
    >
      Reservar {{ seats }} cupo(s)
    </button>
  </article>
</template>
