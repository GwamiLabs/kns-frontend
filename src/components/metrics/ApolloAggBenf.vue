<script setup>
import { ref, onMounted } from 'vue'
//import apolloClient from '../../apollo/client.js'
//import { AGG_BENF_KI } from '../../graphql'
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
  /*
  const { data } = await apolloClient.query({
    query: AGG_BENF_KI,
    variables:{
      beneficiary:props.beneficiary,
      address:"",
      first: props.first,
      skip: props.skip,
      ordering: "beneficiary",
      direction:"desc"
    }
  })

const totalsByBeneficiary =data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiary] ) {
        pv[cv.beneficiary] += parseFloat(cv.amount)
    } else {
        pv[cv.beneficiary] = parseFloat(cv.amount)
    }
    return pv;
}, {})

const countsByBeneficiary =data.klimaRetires.reduce((pv, cv) => {
    if ( pv[cv.beneficiary] ) {
        pv[cv.beneficiary] += 1
    } else {
        pv[cv.beneficiary] = 1
    }
    return pv;
}, {})

if (props.mode === "MAX_COUNT"){
  let tempCount=[]
  for(let i in countsByBeneficiary){
      tempCount.push([countsByBeneficiary[i], totalsByBeneficiary[i], i])
  }
  response.value  = tempCount.sort((pv, cv)=>cv[0]-pv[0]).slice(0,props.numUsers)
} else { // MAX_AMOUNT or other modes
  let tempSum=[]
  for(let i in totalsByBeneficiary){
      tempSum.push([totalsByBeneficiary[i], countsByBeneficiary[i], i])
  }
  response.value  = tempSum.sort((pv, cv)=>cv[0]-pv[0]).slice(0,props.numUsers)
}
*/
})
</script>

<template>
  <div class="response">
    <code>{{ response }}</code>
    <table>
      <thead>
      <tr>
        <th >Beneficiary</th>
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
