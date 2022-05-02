<script setup>
import { ref, onMounted } from 'vue'
//import apolloClient from '../../apollo/client.js'
//import { GEN_KI } from '../../graphql'
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
  /*
  const { data } = await apolloClient.query({
    query: GEN_KI,
    variables:{
      beneficiary:props.beneficiary,
      address:props.address,
      first: props.first,
      ordering: props.ordering,
      direction:props.direction
    }
  })

  response.value = data.klimaRetires
*/
})
</script>

<template>
  <div class="response">
    <code>{{ response }}</code>
    <table>
        <thead>
        <tr>
          <th v-for="header in tableheaders">{{header}}</th>
        </tr>
        </thead>
        <tr v-for="row in response">
        <td v-for="cell in Object.values(row)"> {{cell}} </td>
        </tr>
    </table> 
  </div>

</template>
