<template>
<!--<img src={{imageAddress}} />-->
<!--{{imageAddress}}-->
{{testData}}
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex';
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";
import MyDomain from '../components/MyDomain.vue';
import Sidebar from '../components/Sidebar.vue';
import Referral from '../components/Referral.vue';
import tlds from '../../abi/tlds.json';
import tldAbi from '../../abi/PunkTLD.json';
import erc20Abi from '../../abi/Erc20.json';
import useChainHelpers from "../../hooks/useChainHelpers";

export default {

    name: "MetricImage",

    date(){
        return {
            imageAddress: null,
            testData: null
        }
    },

    props:{
        domain: String,
    },

    components:{},

    computed: {
        ...mapGetters("user", ["getUserAddress", "getUserBalance", "getUserAllDomainNames", "getUserSelectedNameData"]),
        ...mapGetters("klima", ["getKlimaTldAddress"]),
    },

    methods: {
        async getDomainPicture(){
            const existingDomainLower = this.domain.toLowerCase();
            const existingDomainParts = existingDomainLower.split(".");

            const fProvider = this.getFallbackProvider(137);
            const intfc = new ethers.utils.Interface(tldAbi);
            const contract = new ethers.Contract(this.getKlimaTldAddress, intfc, fProvider);

            const name = existingDomainParts[0];

            const checkDomainHolder = await contract.getDomainHolder(name);
            
            //const userDefaultName = await contract.defaultNames(checkDomainHolder);
        
            if (existingDomainParts[0] && existingDomainParts[1]==".klima") {

                const nameData = await contract.domains(name);

                this.testData = nameData;

                // get contract image for that token ID
                let metadata = await contract.tokenURI(nameData.tokenId);
                let imgFound = false;

                if (nameData.data) {
                    const customData = JSON.parse(nameData.data);
                
                    if (customData.imgAddress && !customData.imgAddress.startsWith("0x")) {
                        this.imageAddress = customData.imgAddress.replace("ipfs://", "https://ipfs.io/ipfs/");
                        imgFound = true;
                    } else if (customData.imgAddress) {
                        // fetch image URL of that PFP
                        const pfpInterface = new ethers.utils.Interface([
                            "function tokenURI(uint256 tokenId) public view returns (string memory)"
                        ]);
                        const pfpContract = new ethers.Contract(customData.imgAddress, pfpInterface, fProvider);
                        metadata = await pfpContract.tokenURI(customData.imgTokenId);
                    }

                    if (metadata.includes("ipfs://")) {
                        metadata = metadata.replace("ipfs://", "https://ipfs.io/ipfs/");
                    } 
                    
                    if (metadata.includes("http")) {
                        const response = await fetch(metadata);
                        const result = await response.json();

                        if (result && result.image) {
                            this.imageAddress = result.image.replace("ipfs://", "https://ipfs.io/ipfs/");
                            imgFound = true;
                        }
                    }
                }

                if (metadata && !imgFound) {
                    const json = atob(metadata.substring(29));
                    const result = JSON.parse(json);

                    if (result && result.image) {
                        this.imageAddress = result.image;
                    }
                }
            }
        }

    },

    setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();

    const { getFallbackProvider } = useChainHelpers();

    return {
            address, 
            getFallbackProvider, 
            isActivated, 
            signer, 
            toast }
  },
  
  onMounted(){
      
      this.getDomainPicture();

  }

}
</script>
<style>
</style>