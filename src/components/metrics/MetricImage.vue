<template>
<img :src="imgAddress" :width="width" :height="height" />
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
import { ref, toRefs, onMounted } from 'vue';
import { useStore } from 'vuex';

export default {

    name: "MetricImage",

    props:{
        domain: String,
        height:{
            type: String,
            default: "100"
        },
        width:{
            type: String,
            default: "100"
        }, 
    },

    setup(props) {
    
    const { domain } = toRefs(props);
    
    const { address, isActivated, signer } = useEthers();
    const { getFallbackProvider } = useChainHelpers();
    
    const store = useStore();
    const klimaTLDAddress = store.getters['klima/getKlimaTldAddress'];
    

    const imgAddress = ref(
        "https://upload.wikimedia.org/wikipedia/commons/b/bc/Unknown_person.jpg");
    //NOTE we may want more props than just the domain.
    async function getDomainPicture(domain){
            //console.log("In getDomainPicture()");
            const existingDomainLower = domain.toLowerCase();
            const existingDomainParts = existingDomainLower.split(".");

            const fProvider = getFallbackProvider(137);
            const intfc = new ethers.utils.Interface(tldAbi);
            const contract = new ethers.Contract(klimaTLDAddress, intfc, fProvider);

            //console.log( await contract.symbol());
            
            const name = existingDomainParts[0];
            
            // const checkDomainHolder = await contract.getDomainHolder(name);
            // console.log(await checkDomainHolder);
            // console.log("Check part 1...", 
            //             existingDomainParts[0],
            //             "...check part 2...",
            //             existingDomainParts[1]);
            //const userDefaultName = await contract.defaultNames(checkDomainHolder);
        
            if (existingDomainParts[0] && existingDomainParts[1]=="klima") {
                console.log("In first if check");
                const nameData = await contract.domains(name);
                //console.log(nameData);
                
                // get contract image for that token ID
                let metadata = await contract.tokenURI(nameData.tokenId);
                let imgFound = false;

                if (nameData.data) {
                    
                    const customData = JSON.parse(nameData.data);
                
                    if (customData.imgAddress && !customData.imgAddress.startsWith("0x")) {
                        console.log("2, ", customData.imgAddress.replace("ipfs://", "https://ipfs.io/ipfs/"));
                        imgAddress.value = customData.imgAddress.replace("ipfs://", "https://ipfs.io/ipfs/");
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
                            imgAddress.value = result.image.replace("ipfs://", "https://ipfs.io/ipfs/");
                            console.log("3 ", result.image.replace("ipfs://", "https://ipfs.io/ipfs/"));
                            imgFound = true;
                        }
                    }
                }

                if (metadata && !imgFound) {
                    console.log("checking metadata...", metadata);
                    const json = atob(metadata.substring(29));
                    const result = JSON.parse(json);
                    console.log(result);

                    if (result && result.image) {
                        imgAddress.value = result.image;
                        console.log("4, ", result.image);

                    }
                }
            }
        }

    onMounted(async()=>{
        await getDomainPicture(domain.value);
    })


    return {
            imgAddress,
            address,
            getFallbackProvider}
  },


}
</script>
<style>
</style>