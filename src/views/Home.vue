<template>
  <div class="d-flex flex-row-wrap overall-container">
    <div class="box-main">
      <div class="lede lede-text">
        Mint your own .klima domain
      </div>
      <div class = "lede lede-subtitle">
        Each domain comes with a percentage of retired offset carbon
      </div>
      <div class="lede headline-price">
        {{getWrapperTldPrice}} USDC per domain
      </div>
      <div class="lights">
        <a class="icons" href="" target="_blank"><i class="bi bi-journal-text"></i></a>
        <a class="icons" target="_blank" href="https://github.com/GwamiLabs"><i class="bi bi-github"></i></a>
        <a class="icons" target="_blank" href="https://discord.gg/gwamilabs"><i class="bi bi-discord"></i></a>
        <a class="icons" target="_blank" href="https://twitter.com/gwamilabs"><i class="bi bi-twitter"></i></a>
      </div>

          <div class="input-group domain-input input-group-lg">
            <input
              v-model="chosenDomainName" 
              placeholder="enter domain name"
              type="text" 
              class="form-control text-end" 
              aria-label="Text input with dropdown button"
            >
            <span class="input-group-text tld-addon">
              <span v-if="loading" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
              <span>.klima</span>
            </span>
          </div>
          <div class="input-group domain-input-textarea input-group-lg">
            <textarea
              v-model="retirementMessage"
              maxlength="500" 
              placeholder=
"Additional perk:
Write a love letter to the planet while retiring your carbon offsets here
(max 500 characters)"
              type="text" 
              rows="3"
              class="form-control text-start"
            ></textarea>
          </div>

        <p class="error">
          <small v-if="buyNotValid(chosenDomainName).invalid">
            <em>{{ buyNotValid(chosenDomainName).message }}</em>
          </small>
        </p>

        <!-- Wrapper contract paused -->
        <button v-if="isActivated && getWrapperPaused" class="btn btn-primary buy-button" :disabled="true">
          <span v-if="getWrapperPaused">Buying paused</span>
        </button>

        <!-- Too low USDC balance -->
        <button v-if="isActivated && isNetworkSupported && !getWrapperPaused && !hasUserEnoughUsdc" class="btn btn-primary buy-button" @click="approveUsdc" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
          <span>Your USDC balance is too low</span>
        </button>

        <!-- Approve USDC -->
        <button data-bs-toggle="modal" data-bs-target="#approveUsdcModal" v-if="isActivated && isNetworkSupported && !getWrapperPaused && !hasEnoughUsdcAllowance && hasUserEnoughUsdc" class="btn btn-primary buy-button" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
          <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Approve USDC</span>
        </button>

        <!-- Buy domain -->
        <button v-if="isActivated && isNetworkSupported && !getWrapperPaused && hasEnoughUsdcAllowance && hasUserEnoughUsdc" class="btn btn-primary buy-button" @click="buyDomain" :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc">
          <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span>Buy domain</span>
        </button>

        <!-- Connect Wallet -->
        <button v-if="!isActivated" class="btn btn-primary buy-button" @click="open">Connect wallet</button>

        <div v-if="isActivated && !isNetworkSupported" class="buy-button">
          <button class="btn btn-primary buy-button" @click="changeNetwork('Polygon')">Switch to Polygon</button>
        </div>
      <!--use this in production: tough in testing to be so strict
        <div v-if="isActivated && isNetworkSupported && 
            !getWrapperPaused && !hasEnoughUsdcAllowance && 
            hasUserEnoughUsdc" class="mint-warning">
        -->
        <div v-if="isActivated && isNetworkSupported" class="mint-warning">     
            <span>Important: Before minting, remember to complete 2 transactions.</span>
            <br><span>1. Approve</span>
            <br><span>2. Buy Domain</span>
        </div>
        <Referral v-if="isActivated" />
    </div>
    <div class="dropdown-spacer">
    </div>
  </div>

  


  <!-- Approve USDC Modal -->
  <div class="modal fade" id="approveUsdcModal" tabindex="-1" aria-labelledby="approveUsdcModalLabel" aria-hidden="true" modal-dialog-centered>
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="approveUsdcModalLabel">Approve USDC</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <p>
              If you plan to mint multiple domains, consider giving the minting contract a higher USDC approval. 
              With each domain buy, the total approval amount is reduced by {{getWrapperTldPrice}} USDC. (Worry not, 
              redundant approval amount can later be reduced to 0.)
            </p>

            Approval for <input type="text" id="recipient-name" v-model="chosenAllowance"> USDC.
          </div>
        </div>
        <div class="modal-footer">
          <button 
            type="button" 
            @click="approveUsdc" 
            class="btn btn-secondary"
            :disabled="selectedAllowanceTooLow" 
            >
              <span v-if="!selectedAllowanceTooLow">Approve USDC</span>
              <span v-if="selectedAllowanceTooLow">Approval lower than domain price</span>
            </button>

          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import { useBoard, useEthers } from 'vue-dapp';
import { mapActions, mapGetters, mapMutations } from 'vuex';
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import Referral from '../components/Referral.vue';
import useDomainHelpers from "../hooks/useDomainHelpers";
import useChainHelpers from "../hooks/useChainHelpers";
import KlimaPunkDomainsAbi from "../abi/KlimaPunkDomains.json";
import erc20Abi from '../abi/Erc20.json';

export default {
  name: "Home",

  data() {
    return {
      chosenDomainName: null,
      chosenAllowance: null,
      loading: false, // loading data
      retirementMessage: null,
      waiting: false, // waiting for TX to complete
      wrapperContract: null
    }
  },

  components: {
    Referral
  },

  created() {
    this.chosenAllowance = this.getWrapperTldPrice;
  },

  computed: {
    ...mapGetters("user", ["getUsdcAddress", "getUsdcAllowance", "getUsdcBalance"]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),
    ...mapGetters("klima", ["getKlimaWrapperAddress", "getKlimaTldContract", "getWrapperTldPrice", "getWrapperPaused"]),

    selectedAllowanceTooLow() {
      if (Number(this.chosenAllowance) >= Number(this.getWrapperTldPrice)) {
        return false;
      }

      return true;
    },

    domainLowerCase() {
      return this.chosenDomainName.toLowerCase();
    },

    hasEnoughUsdcAllowance() {
      if (this.address && Number(this.getWrapperTldPrice) > 0 && Number(this.getUsdcBalance) > 0) {
        if (Number(this.getUsdcAllowance) >= Number(this.getWrapperTldPrice)) {
          return true;
        }
      }

      return false;
    },

    hasUserEnoughUsdc() {
      if (this.address && Number(this.getWrapperTldPrice) > 0 && Number(this.getUsdcBalance) > 0) {
        if (Number(this.getUsdcBalance) >= Number(this.getWrapperTldPrice)) {
          return true;
        }
      }

      return false;
    },

    isNetworkSupported() {
      if (this.isActivated) {
        if (this.chainId === 137) {
          return true;
        }
      }

      return false;
    }
  },

  methods: {
    ...mapMutations("user", ["addDomainManually", "setUsdcAllowance"]),

    async approveUsdc() {
      this.waiting = true;

      // USDC contract
      const usdcIntfc = new ethers.utils.Interface(erc20Abi);
      const usdcContractSigner = new ethers.Contract(this.getUsdcAddress, usdcIntfc, this.signer);

      try {
        const tx = await usdcContractSigner.approve(
          this.getKlimaWrapperAddress, // spender (wrapper contract)
          ethers.utils.parseUnits(this.chosenAllowance, "mwei") // amount (in mwei, 6 decimals)
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        document.getElementById('approveUsdcModal').click(); // close the modal

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully set the allowance! Now proceed with buying the domain.", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.setUsdcAllowance(this.chosenAllowance);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waiting = false;
        }

      } catch (e) {
        console.log(e)
        this.waiting = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waiting = false;
    },

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + ".klima";

      // check if domain already minted
      const existingHolder = await this.getKlimaTldContract.getDomainHolder(this.domainLowerCase);

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {type: TYPE.ERROR});
        this.waiting = false;
        return;
      }

      // wrapper contract (with signer)
      const wrapperIntfc = new ethers.utils.Interface(KlimaPunkDomainsAbi);
      const wrapperContractSigner = new ethers.Contract(this.getKlimaWrapperAddress, wrapperIntfc, this.signer);

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        let retMsg;

        if (!this.retirementMessage) {
          retMsg = "";
        } else {
          retMsg = this.retirementMessage + " - via www.kns.earth"
        }

        const tx = await wrapperContractSigner.mint(
          this.domainLowerCase,
          this.address,
          referral,
          retMsg // retire message
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer."
            }
          },
          {
            type: TYPE.INFO,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully bought the domain!", {
            type: TYPE.SUCCESS,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          this.addDomainManually(fullDomainName);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () => window.open(this.getBlockExplorerBaseUrl+"/tx/"+tx.hash, '_blank').focus()
          });
          console.log(receipt);
          this.waiting = false;
        }

      } catch (e) {
        console.log(e)
        this.waiting = false;
        this.toast(e.message, {type: TYPE.ERROR});
      }

      this.waiting = false;
    },

    changeNetwork(networkName) {
      const networkData = this.switchNetwork(networkName); 

      window.ethereum.request({ 
        method: networkData.method, 
        params: networkData.params
      });
    }
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return { address, buyNotValid, chainId, isActivated, open, signer, switchNetwork, toast }
  }
}
</script>

<style scoped>

.overall-container>*{
  padding: 10px;
  margin:10px;
  flex: 1 100%;
  border-radius: 13px;
}

.lights {
  margin-top:20px;
  float:left;
  width: 100%;
}

.bi {
  margin-inline: 5px;
  font-size: 28px;
  padding: 5px;
  color: #2B2B2B;
}

.box-left {
  margin-left:55px;
  width:340px;
}
.box-main {
  margin-left:55px;
  display: flex;
  margin-right: 224px;
  flex-flow:row;
}


.lede-text {
  order:1;
  color: #232B2B;
  font-size:80px;
  font-weight: 400;
}
.lede-subtitle {
  order:3;
  color: #a1a1a1;
  font-size:24px;
  font-weight: normal;
}
.headline-price {
  order:3;
  font-size:24px;
  font-weight: bold;
}
.mint-warning {
  order:2;
  padding-left: 10%;;
  color: #232B2B;
  font-size:16px;
  font-weight: 400;
}


.buy-button {
  order:2;
  margin-top: 10px;
  margin-bottom: 10px;
  font-weight: bold;
  font-size: 24px;
  height: 72px;
  width: 100%;
}

.domain-input {
  order:2;
  height:72px;
  border-radius: 13px;
}

.domain-input-textarea {
  order:2;
  margin-top: 10px;
  height: 138px;
  border-radius: 13px;
}


.error {
  color: #DBDFEA;
}

.ret-msg {
  text-decoration: underline;
}

.ret-msg:hover {
  cursor: pointer;
  text-decoration: none;
}

.tld-addon {
  background-color: white;
}

@media only screen and (max-width: 767px) {
  .domain-input {
    width: 100%;
  }
}
</style>