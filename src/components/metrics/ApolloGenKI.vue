<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MetricImage from './MetricImage.vue'
import { useQuery, useResult } from '@vue/apollo-composable'
import { GEN_KI } from '../../graphql'
//import { useGeneralKI } from '../../apollo/useApolloHelpers'

const props = defineProps({
  beneficiary: String,
  address: String,
  first: Number,
  skip: Number,
  ordering: String,
  direction: String
})

const { result, loading, error } = useQuery(
  GEN_KI,
  {
    beneficiary:props.beneficiary,
    address:props.address,
    first: props.first,
    skip: props.skip,
    ordering: props.ordering,
    direction:props.direction
  }//if we want to make this responsive wrap this sec in a lambda fn
)

const klimaRetires = useResult(result)




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
          <th>AddressTonnes</th>
          <th>addressTimes</th>
          <th>beneficiaryTonnes</th>
          <th>beneficiaryTonnes</th>
          <th>projectName</th>
          <th>addressProjectTonnes</th>
          <th>addressProjectTimes</th>
          <th>benfProjectTonnes</th>
          <th>benfProjectTimes</th>   
          <th>Bridge</th>
          <th>Project ID</th>
        </tr>
        </thead>
        <tr v-for="row in klimaRetires">
        <!--<td v-for="cell in Object.values(row)"> {{cell}} </td>-->
        <td><MetricImage :domain="row.beneficiary" :key="row.id" /></td>
        <td>{{row.beneficiary}}</td>
        <td>{{row.beneficiaryAddress}}</td>
        <td>{{row.transaction.id}}</td>
        <td>{{row.timestamp}}</td>
        <td>{{row.amount}}</td>
        <td>{{row.addressTonnes}}</td>
        <td>{{row.addressTimes}}</td>
        <td>{{row.beneficiaryTonnes}}</td>
        <td>{{row.beneficiaryTonnes}}</td>
        <td>{{row.projectName}}</td>
        <td>{{row.addressProjectTonnes}}</td>
        <td>{{row.addressProjectTimes}}</td>
        <td>{{row.benfProjectTonnes}}</td>
        <td>{{row.benfProjectTimes}}</td> 
        <td>{{row.offset.bridge}}</td>
        <td>{{row.offset.projectID}}</td>
        </tr>
    </table> 
  </div>

</template>
