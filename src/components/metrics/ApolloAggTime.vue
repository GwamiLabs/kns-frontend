<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAggTimeKI } from '../../apollo/useApolloHelpers'

const response = ref([])

const props = defineProps({
  numPeriods: Number,
  periodInSecs: Number,
  first: Number,
  skip: Number,
  mode: String //MAX_COUNT, MAX_AMOUNT, LATEST
})

onMounted(async () => {
  response.value = await useAggTimeKI(props.numPeriods,
                                      props.periodInSecs,
                                      props.first,
                                      props.skip,
                                      props.mode)

})
</script>

<template>
  <div class="response">
    <!--<code>{{ response }}</code>-->
    <table class="table">
      <thead>
      <tr>
        <th >Time</th>
        <th v-if="props.mode=='MAX_COUNT'">Retirements</th>
        <th v-else-if="props.mode=='MAX_AMOUNT'">Tonnes</th>
        <th v-else="props.mode=='MAX_AMOUNT'">Tonnes</th>
        </tr>
        </thead>
        <tbody v-if="props.mode =='MAX_COUNT'">
        <tr v-for="row in response">
          <td> {{row[1]}} </td>
          <td> {{row[0]}} </td>
        </tr>
        </tbody>
        <tbody v-else-if="props.mode =='MAX_AMOUNT'">
        <tr v-for="row in response">
          <td> {{row[1]}} </td>
          <td> {{row[0]}} </td>
        </tr>
        </tbody>
        <tbody v-else>
        <tr v-for="row in response">
          <td> {{row[0]}} </td>
          <td> {{row[1]}} </td>
        </tr>
        </tbody>
        </table>
  </div>
</template>
