<script setup>
import { ref, onMounted } from 'vue'
//import apolloClient from '../../apollo/client.js'
//import { AGG_TIME_KI } from '../../graphql'
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
  /*
  const { data } = await apolloClient.query({
    query: AGG_TIME_KI,
    variables:{
      beneficiary:"",
      address:"",
      first: 1000,
      skip: 463,
      ordering: "timestamp",
      direction:"asc"
    }
  })

  //const periodsInAnalysis = (Date.now()-data.klimaRetires[0]

  const totalsByTimestamp = data.klimaRetires.reduce((pv, cv) => {
    let timeshift = Math.floor((Number(Date.now())-Number(cv.timestamp))%props.periodInSecs)
    if(timeshift >= Math.floor(props.periodInSecs/2)){
      timeshift *= -1 //more towards the earlier graph point.
    }
    let cvTime = Number(cv.timestamp) + timeshift
    if ( pv[cvTime] ) {
        pv[cvTime] += parseFloat(cv.amount)
    } else {
        pv[cvTime] = parseFloat(cv.amount)
    }
    return pv;
}, {})

  const countsByTimestamp = data.klimaRetires.reduce((pv, cv) => {
    let timeshift = Math.floor((parseInt(Date.now())-parseInt(cv.timestamp))%props.periodInSecs)
    if(timeshift >= Math.floor(props.periodInSecs/2)){
      timeshift *= -1 //more towards the earlier graph point.
    }
    let cvTime = Math.floor(Number(cv.timestamp) + timeshift)
    if ( pv[cvTime] ) {
        pv[cvTime] += 1
    } else {
        pv[cvTime] = 1
    }
    return pv;
}, {})

if (props.mode === "MAX_AMOUNT"){
  let tempSum=[]
  for(let i in totalsByTimestamp){
    tempSum.push([totalsByTimestamp[i], i])
  }
  response.value  = tempSum.sort((pv, cv)=>cv[0]-pv[0]).slice(0,props.numPeriods)
} else if (props.mode === "MAX_COUNT"){
  let tempCount=[]
  for(let i in countsByTimestamp){
    tempCount.push([countsByTimestamp[i], i])
  }
  response.value  = tempCount.sort((pv, cv)=>cv[0]-pv[0]).slice(0,props.numPeriods)
} else {
    let tempTime=[]
  for(let i in totalsByTimestamp){
    tempTime.push([i, totalsByTimestamp[i]])
  }
  response.value  = tempTime.sort((pv, cv)=>cv[0]-pv[0]).slice(0,props.numPeriods)
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
        <th >Time</th>
        <th v-if="props.mode=='MAX_COUNT'">Count</th>
        <th v-else-if="props.mode=='MAX_AMOUNT'">Amount</th>
        <th v-else="props.mode=='MAX_AMOUNT'">Amount</th>
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
