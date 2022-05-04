<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetricImage from './MetricImage.vue'
import {useAggBenfKI} from '../../apollo/useApolloHelpers'

const response = ref([])

const props = defineProps({
  beneficiary: String,
  numUsers: Number,
  first: Number,
  skip: Number,
  mode: String //MAX_AMOUNT, MAX_COUNT and a default
})

onMounted(async () => {
  response.value = await useAggBenfKI(props.beneficiary, props.numUsers, props.first, props.skip, props.mode)

})
</script>

<template>
  <div class="response">
    <!--<code>{{ response }}</code>-->
    <table class="table">
      <thead>
      <tr>
        <th>Avatar</th>
        <th >Beneficiary</th>
        <th>Tonnes</th>
        <th>Retirements</th>
        </tr>
        </thead>
        <tbody v-if="props.mode=='MAX_COUNT'">
        <tr v-for="row in response">
          <td><MetricImage :domain="row[2]" :key="row.id" /></td>
          <td> {{row[2]}} </td>
          <td> {{row[1]}} </td>
          <td> {{row[0]}} </td>
        </tr>
        </tbody>
        <tbody v-else>
        <tr v-for="row in response">
          <td><MetricImage :domain="row[2]" :key="row.id" /></td>
          <td> {{row[2]}} </td>
          <td> {{row[0]}} </td>
          <td> {{row[1]}} </td>
        </tr>
        </tbody>
        </table>
  </div>
</template>
