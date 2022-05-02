<script setup>
import { ref, onMounted } from 'vue'
//import apolloClient from '../../apollo/client'
//import { AGG_ADDR_KI } from '../../graphql'
import { useAggAddrKI } from '../../apollo/useApolloHelpers'

const response = ref([])

const props = defineProps({
  address: String,
  first: Number,
  skip: Number,
  numUsers: Number,
  mode: String  //MAX_AMOUNT, MAX_COUNT and a default
})

onMounted(async () => {
  response.value = await useAggAddrKI(props.address, props.first, props.skip, props.numUsers, props.mode)

})
</script>

<template>
  <div class="response">
    <code>{{ response }}</code>
    <table>
      <thead>
      <tr>
        <th >Address</th>
        <th>Amount</th>
        <th>Count</th>
        </tr>
        </thead>
        <tbody v-if="props.mode=='MAX_COUNT'">
        <tr v-for="row in response">
          <td> {{row[2]}} </td>
          <td> {{row[1]}} </td>
          <td> {{row[0]}} </td>
        </tr>
        </tbody>
        <tbody v-else>
        <tr v-for="row in response">
          <td> {{row[2]}} </td>
          <td> {{row[0]}} </td>
          <td> {{row[1]}} </td>
        </tr>
        </tbody>
        </table>
  </div>
</template>
