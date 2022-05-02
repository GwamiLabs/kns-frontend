<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {useAggBenfKI} from '../../apollo/useApolloHelpers'


const { address, isActivated, signer } = useEthers()
const { getFallbackProvider } = useChainHelpers()

const response = ref([])

const props = defineProps({
  beneficiary: String,
  numUsers: Number,
  first: Number,
  skip: Number,
  mode: String //MAX_AMOUNT, MAX_COUNT and a default
})

onMounted(async () => {
  //testing drawing from other script tag; comment out to test direct call
  response.value = await getTopDomainPics()
  const KlimaTldAddress = "0xe8b97542A433e7eCc7bB791872af04DF02A1a6E4"
  const topXdata = await useAggBenfKI(props.beneficiary, props.numUsers, props.first, props.skip, props.mode)
  //response.value = topXdata[3][2].slice(0,-6)
  const intfc = new ethers.utils.Interface(tldAbi);
  //response.value = KlimaTldAddress
  const contract = new ethers.Contract(KlimaTldAddress, intfc, signer);
  response.value= await contract.getDomainHolder("timmy")
  for(let i=0; i<topXdata.length; i++){
    let domainData = await contract.getDomainData(topXdata[i][2].slice(0,-6));
      topKlimaDomainsPics.push(...topXdata[i], domainData.imgAddress);
  }
  //testing direct ethers call from SFC
  response.value = topKlimaDomainsPics

})
</script>

<script lang="ts">
  import { mapGetters } from 'vuex'
  import { ethers } from 'ethers'
  import tldAbi from '../../abi/PunkTLD.json'
  import useChainHelpers from "../../hooks/useChainHelpers"
  import { useEthers } from 'vue-dapp'

  export default {
    computed: {
      ...mapGetters("klima", ["getKlimaTldAddress"]),
    },

    methods: {
      async getTopDomainPics(){
        return 1;
        return ([props.beneficiary, props.numUsers, props.first, props.skip, props.mode])
        const topXdata = await useAggBenfKI(props.beneficiary, props.numUsers, props.first, props.skip, props.mode)
        const intfc = new ethers.utils.Interface(tldAbi);
        const contract = new ethers.Contract(KlimaTldAddress, intfc, signer);
        const topKlimaDomainsPics=[];
        for(let i=0; i<topXdata.length; i++){
          let domainData = await contract.getDomainData(topXdata[i][2].slice(0,-6));
            topKlimaDomainsPics.push(...topXdata[i], domainData.imgAddress);
        }
        return topKlimaDomainsPics;
      },

    },
  }



</script>

<template>
  <div class="response">
    <code>{{ response }}</code>
    <table class="table">
      <thead>
      <tr>
        <td>Avatar</td>
        <th >Beneficiary</th>
        <th>Tonnes</th>
        <th>Retirements</th>
        </tr>
        </thead>
        <tbody v-if="props.mode=='MAX_COUNT'">
        <tr v-for="row in response">
          <td> <img src="{{row[3]}}" w="100" h="100" /> </td>
          <td> {{row[2]}} </td>
          <td> {{row[1]}} </td>
          <td> {{row[0]}} </td>
        </tr>
        </tbody>
        <tbody v-else>
        <tr v-for="row in response">
          <td> {{row[3]}} </td>
          <td> {{row[2]}} </td>
          <td> {{row[0]}} </td>
          <td> {{row[1]}} </td>
        </tr>
        </tbody>
        </table>
  </div>
</template>
