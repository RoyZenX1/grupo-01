<script setup>
import { computed, onMounted, ref } from 'vue';
import WorkshopCard from './WorkshopCard.vue';
import { list, reserve } from './http.mjs';
const items = ref([]);
const search = ref('');
const mode = ref('normal');
const loading = ref(false);
const saving = ref(false);
const readError = ref('');
const writeError = ref('');
const confirmation = ref(null);
const visible = computed(() => items.value.filter(w =>
  w.title.toLowerCase().includes(search.value.toLowerCase().trim())));
const total = computed(() => items.value.reduce((n, w) => n + w.seats, 0));
async function load() {
  if (loading.value) return;
  loading.value = true;
  readError.value = '';
  try { items.value = await list('', mode.value); }
  catch (e) { readError.value = e.message; }
  finally { loading.value = false; }
}
async function book(id) {
  if (saving.value || loading.value || readError.value) return;
  saving.value = true;
  writeError.value = '';
  confirmation.value = null;
  try { confirmation.value = await reserve({ workshopId: id, seats: 1 }); }
  catch (e) { writeError.value = `${e.message}. Consulta antes de repetir.`; }
  finally {
    mode.value = 'normal';
    await load();
    saving.value = false;
  }
}
onMounted(load);
</script>
<template>
  <main>
    <p class="eyebrow">UTP · VUE 3</p><h1>Portal de talleres</h1>
    <label>Buscar <input v-model="search" type="search"></label>
    <label>Escenario <select v-model="mode" :disabled="loading || saving">
      <option value="normal">Normal</option><option value="vacio">Vacío</option>
      <option value="error">503</option><option value="lento">Lento</option>
      <option value="agotado">Timeout</option><option value="invalido">Inválido</option>
    </select></label>
    <button @click="load" :disabled="loading || saving">Consultar</button>
    <p role="status" v-if="loading">Consultando...</p>
    <p role="alert" v-if="readError">{{ readError }}</p>
    <p v-if="!loading && !readError">Cupos totales: {{ total }}</p>
    <p v-if="!loading && !readError && visible.length === 0">Sin resultados</p>
    <div class="tiles" v-if="!readError && !loading">
      <WorkshopCard v-for="w in visible" :key="w.id" :workshop="w"
        :disabled="saving || mode !== 'normal'" @reserve="book" />
    </div>
    <p role="status" v-if="saving">Procesando reserva...</p>
    <p role="alert" v-if="writeError">{{ writeError }}</p>
    <p role="status" v-if="confirmation">Reserva {{ confirmation.id }}.
      Saldo al confirmar: {{ confirmation.remaining }}.</p>
  </main>
</template>
