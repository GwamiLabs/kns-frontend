<template>

  <div class="row">
    <div class="col-md-3" id="sidebar-container">
      <Sidebar />
    </div>

    <div class="col-md-9">
      <div>
        <h1>Biggest 24 hour periods for tonnes retired</h1>
        <h1>{{meta.env.VITE_API_URL}}</h1>
        <ApolloAggTime :numPeriods="5"
                      :periodInSecs="86400"
                      :first="1"
                      :skip="0"
                      mode="MAX_AMOUNT"
        />
      </div>
      <div>
        <h1>Biggest 24 hour periods for no. of retirements</h1>
        <ApolloAggTime :numPeriods="5"
                      :periodInSecs="86400"
                      :first="1000"
                      :skip="0"
                      mode="MAX_COUNT"
        />
      </div>
      <div>
        <h1>Top .Klima Domains (by Beneficiary Name) - Total Tonnes Retired</h1>
        <!--<ApolloDotKlimaPics beneficiary=".klima" :numUsers="5"
                      :first="1000"
                      :skip="0" mode="MAX_AMOUNT" />-->
      </div>  
      <div>
        <h1>Top General Users (by Beneficiary Name) - Total Tonnes Retired</h1>
        <ApolloAggBenf beneficiary="" :numUsers="5"
                :first="1000"
                :skip="0" mode="MAX_AMOUNT" />
      </div>
      <div>
        <h1>Top General Users (by Beneficiary Name) - No. of Times Retired</h1>
        <ApolloAggBenf beneficiary="" :numUsers="5"
                :first="1000"
                :skip="0" mode="MAX_COUNT" />
      </div>
      <div>
        <h1>Top General Users (by Beneficiary Address) - Total Tonnes Retired</h1>
        <ApolloAggAddr address="" :numUsers="5" 
                :first="1000"
                :skip="0" mode="MAX_AMOUNT" />
      </div>
      <div>
        <h1>Top General Users (by Beneficiary Address) - No. of Times Retired</h1>
        <ApolloAggAddr address="" :numUsers="5" 
                :first="1000"
                :skip="0" mode="MAX_COUNT" />
      </div>
      <div>
        <h1>Top Klima Users (by Beneficiary Name) - Total Tonnes Retired</h1>
        <ApolloAggBenf beneficiary=".klima" :numUsers="10"
                :first="1000"
                :skip="0" mode="MAX_AMOUNT" />
      </div>
      <div>
        <h1>Top Klima Users (by Beneficiary Name) - No. of Times Retired</h1>
        <ApolloAggBenf beneficiary=".klima" :numUsers="10"
                :first="1000"
                :skip="0" mode="MAX_COUNT" />
      </div>
      <div>
        <h1>Largest .klima Domain Retirements</h1>
          <ApolloGenKI 
            beneficiary = ".klima"
            address = ""
            :first = "1000"
            :skip = "0"
            ordering = "amount"
            direction = "desc"
            />
      </div>
      <div>
        <h1>Latest .klima Domain Retirements</h1>
          <ApolloGenKI 
            beneficiary = ".klima"
            address = ""
            :first = "1000"
            :skip = "0"
            ordering = "timestamp"
            direction = "desc"
            />
      </div>

      <!-- Show this if user is not connected -->
      <div class="row" v-if="!isActivated">
        <div class="col-md-12 mb-3">
          <div class="container text-center">
            <h3><i class="bi bi-exclamation-triangle"></i> Not connected <i class="bi bi-exclamation-triangle"></i></h3>
            <p class="text-break">
              Please connect with your wallet to see your profile data.
            </p>
          </div>
        </div>
      </div>

      <!-- Address and balance -->
      <div class="row" v-if="isActivated">
        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Address</h3>
            <p class="text-break">{{getUserAddress}}</p>
          </div>
        </div>

        <div class="col-md-6 mb-3">
          <div class="container text-center">
            <h3>Balance</h3>
            <p class="text-break">
              <span>{{ getUsdcBalance }} USDC</span>
            </p>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <div class="container">
            <h3>Domains</h3>

            <table class="table table-hover mt-4 mb-4">
              <tbody>
                <tr v-for="domainName in getUserAllDomainNames">
                  <MyDomain :domain="domainName" />
                </tr>
              </tbody>
            </table>

            <p v-if="getUserSelectedNameData">
              <small><em>
                Don't see your domain here? 
                <span class="span-link" data-bs-toggle="modal" data-bs-target="#addDomainModal">
                  Add it manually</span>.
              </em></small>
            </p>
            <p v-else>
              No domain? No worries, <router-link to="/">buy yourself one here!</router-link>
            </p>
          </div>
        </div>
      </div>

      <Referral />

    </div>
  </div>

  <!-- Add Domain Modal -->
  <div class="modal fade" id="addDomainModal" tabindex="-1" aria-labelledby="addDomainModalLabel" aria-hidden="true" modal-dialog-centered>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addDomainModalLabel">Add your existing domain</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="recipient-name" class="col-form-label">Enter your existing domain:</label>
            <input type="text" class="form-control" id="recipient-name" v-model="existingDomain">
            <small><em>No transaction will be made, this is a free query.</em></small>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            @click="addExistingDomain" 
            class="btn btn-secondary" 
            :disabled="domainNotValid">Add domain</button>

          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<script lang="ts">
import { mapGetters, mapMutations } from 'vuex';
import { ethers } from 'ethers';
import { useEthers } from 'vue-dapp';
import { useToast, TYPE } from "vue-toastification";
import MyDomain from '../components/MyDomain.vue';
import Sidebar from '../components/Sidebar.vue';
import Referral from '../components/Referral.vue';
import tlds from '../abi/tlds.json';
import tldAbi from '../abi/PunkTLD.json';
import erc20Abi from '../abi/Erc20.json';
import useChainHelpers from "../hooks/useChainHelpers";

import ApolloAggTime from '../components/metrics/ApolloAggTime.vue';
import ApolloAggAddr from '../components/metrics/ApolloAggAddr.vue';
import ApolloAggBenf from '../components/metrics/ApolloAggBenf.vue';
import ApolloGenKI from '../components/metrics/ApolloGenKI.vue';
//import ApolloDotKlimaPics from '../components/metrics/ApolloDotKlimaPics.vue';

//import { useAggBenfKI } from "../apollo/useApolloHelpers";

export default {
  name: "Metrics",

  data() {
    return {
      existingDomain: null,
      loading: false,
      topKlimaDomainsPics:[]
    }
  },

  components: {
    MyDomain,
    Referral,
    Sidebar,
    ApolloAggTime,
    ApolloAggAddr,
    ApolloAggBenf,
    ApolloGenKI,
    //ApolloDotKlimaPics
  },

  computed: {
    ...mapGetters("user", ["getUserAddress", "getUserBalance", "getUserAllDomainNames", "getUserSelectedNameData"]),
    ...mapGetters("klima", ["getKlimaTldAddress"]),
    ...mapGetters("user", ["getUsdcAddress", "getUsdcAllowance", "getUsdcBalance", "getUsdcContract"]),

    customData() {
      if (this.getUserSelectedNameData) {
        try {
          return JSON.parse(this.getUserSelectedNameData.data);
        } catch {
          return null
        }
      }

      return null
    },

    domainNotValid() {
      if (this.existingDomain === "") {
        return true;
      } else if (this.existingDomain === null) {
        return true;
      } else if (this.existingDomain.split(".").length != 2) { // only 1 zero allowed (meaning there are two words after split)
        return true;
      } else if (this.existingDomain.includes(" ")) {
        return true;
      } else if (this.existingDomain.includes("%")) {
        return true;
      } else if (this.existingDomain.includes("&")) {
        return true;
      } else if (this.existingDomain.includes("?")) {
        return true;
      } else if (this.existingDomain.includes("#")) {
        return true;
      } else if (!this.existingDomain.includes(".klima")) {
        return true;
      }
    }
  },

  methods: {
    ...mapMutations("user", ["addDomainManually"]),

    async addExistingDomain() {
      const existingDomainLower = this.existingDomain.toLowerCase();
      const existingDomainParts = existingDomainLower.split(".");

      const intfc = new ethers.utils.Interface(tldAbi);
      const contract = new ethers.Contract(this.getKlimaTldAddress, intfc, this.signer);

      const checkDomainHolder = await contract.getDomainHolder(existingDomainParts[0]);

      if (String(checkDomainHolder)===String(this.address)) {
        this.addDomainManually(existingDomainLower);
        this.toast("Domain successfully added.", {type: TYPE.SUCCESS});
      } else {
        this.toast("This domain is not owned by your currently connected address.", {type: TYPE.ERROR});
      }
    },

    //functions to get user Address
        //and find the domain pics for user and
        //.klima leaderboard must be here. This latter one
        //might be a puzzle for another time as we would
        //need to bring the ethers logic here, and loop through
        //the relevant leaderboard domains.
        
      /*async getTopDomainPics(){
        //return 1;
        //return ([props.beneficiary, props.numUsers, props.first, props.skip, props.mode])
        const topXdata = await useAggBenfKI(props.beneficiary, props.numUsers, props.first, props.skip, props.mode)
        const intfc = new ethers.utils.Interface(tldAbi);
        const contract = new ethers.Contract(KlimaTldAddress, intfc, signer);
        const topKlimaDomainsPics=[];
        for(let i=0; i<topXdata.length; i++){
          let domainData = await contract.getDomainData(topXdata[i][2].slice(0,-6));
            topKlimaDomainsPics.push(...topXdata[i], domainData.imgAddress);
        }
        //return topKlimaDomainsPics;
      },*/
  },

  setup() {
    const { address, isActivated, signer } = useEthers();
    const toast = useToast();

    const { getFallbackProvider } = useChainHelpers();

    return { address, getFallbackProvider, isActivated, signer, toast }
  },

}
</script>

<style scoped>
.clipboard {
  cursor: pointer
}

.modal {
  border: 1px solid #00CC33;
}

.table {
  --bs-table-bg: transparent;
  color: #4a4a4a;
}

.table:hover {
  --bs-table-bg: transparent;
  /*--bs-table-hover-bg: #1D1E2C;*/
  --bs-table-hover-bg: transparent;
  --bs-table-hover-color: #232b2b;
}

.span-link:hover {
  font-weight: bold;
  color: #232B2B;
  text-decoration: underline;
}
</style>