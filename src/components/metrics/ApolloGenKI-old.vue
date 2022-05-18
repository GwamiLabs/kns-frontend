<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetricImage from './MetricImage.vue'
import { useGeneralKI } from '../../apollo/useApolloHelpers'


const response = ref([])

const props = defineProps({
  beneficiary: String,
  address: String,
  first: Number,
  skip: Number,
  ordering: String,
  direction: String
})

onMounted(async () => {
  response.value = await useGeneralKI(props.beneficiary,
                                      props.address,
                                      props.first,
                                      props.skip,
                                      props.ordering,
                                      props.direction)
})
</script>

<template>
  <div class="response">
    <!--<code>{{ response }}</code>-->
    <table class="table">
        <thead>
        <tr>
          <!--<th v-for="header in tableheaders">{{header}}</th>-->
          <th>Avatar</th>
          <th>Beneficiary</th>
          <th>Address</th>
          <th>Txn Hash</th>
          <th>Timestamp</th>
          <th>Tonnes</th>
          <th>Bridge</th>
          <th>Project ID</th>
        </tr>
        </thead>
        <tr v-for="row in response">
        <!--<td v-for="cell in Object.values(row)"> {{cell}} </td>-->
        <td><MetricImage :domain="row.beneficiary" :key="row.id" /></td>
        <td>{{row.beneficiary}}</td>
        <td>{{row.beneficiaryAddress}}</td>
        <td>{{row.transaction.id}}</td>
        <td>{{row.timestamp}}</td>
        <td>{{row.amount}}</td>
        <td>{{row.offset.bridge}}</td>
        <td>{{row.offset.projectID}}</td>
        </tr>
    </table> 
  </div>

</template>
