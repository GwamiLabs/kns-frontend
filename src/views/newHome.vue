<template>
  <v-row style="margin-left:2%;margin-right:2%">
    <v-col xs="8" sm="8" md="3" lg="3" xl="3">
        <h1>
          Mint your own<br />
          .klima domain
        </h1>
        <span>
          Each domain comes with a percentage of retired offset carbon
        </span>
        <p style="color: #4a4a4a"><b>100 USDC per domain</b></p>
        <v-row>
          <v-col rows="2">
            <a href="https://www.twitter.com"
              ><v-img
                class="iconImage"
                src="src/assets/social-medium-icon.png"
              ></v-img>
            </a>
          </v-col>
          <v-col rows="2">
            <a href=" https://discord.gg/gwamilabs"
              ><v-img
                class="iconImage"
                src="src/assets/discord-icon.png"
              ></v-img>
            </a>
          </v-col>
          <v-col rows="2">
            <a href="https://twitter.com/gwamilabs"
              ><v-img
                class="iconImage"
                src="src/assets/twitter-icon.png"
              ></v-img>
            </a>
          </v-col>
          <v-col rows="6"> </v-col>
        </v-row>
    </v-col>
    <v-col cols="12" xs="12" sm="12" md="8" lg="8" xl="8">
      <v-row style="margin: 2%">
        <v-card
          variant="outlined"
          style="width: 100%; height: 100%; border-color: #a1a1a1"
        >
          <v-row justify="space-between" style="margin: 1px" @click="clickCard">
            <v-col cols="12" xs="12" sm="12" md="9" lg="9" xl="11">
              <input
                placeholder="Your name here"
                v-model="chosenDomainName"
                class="domainInput"
              />
            </v-col>
            <v-col xs="5" sm="5" md="3" lg="2" xl="1" justify="end">
              <span class="domainSpan" style="color: #232b2b; text-align: end"
                >.klima</span
              >
            </v-col>
          </v-row>
        </v-card>
      </v-row>
      <v-row style="margin: 2%">
        <v-card
          variant="outlined"
          style="width: 100%; height: 100%; border-color: #a1a1a1"
        >
          <v-row justify="space-between" style="margin: 2%" @click="clickCard">
            <textarea
              type="text"
              no-resize
              v-model="loveLetterMessage"
              rows="4"
              placeholder="Additional perk: 
Write a love lettter to planet while retiring your carbon offsets here
(max 500 characters)"
            ></textarea>
          </v-row>
        </v-card>
      </v-row>
      <v-row style="margin: 2%">
        <!-- Wrapper contract paused -->
        <v-btn
          color="primary"
          class="domainButton"
          v-if="isActivated && getWrapperPaused && isNetworkSupported"
          :disabled="true"
        >
          <span style="color: #ffffff" v-if="getWrapperPaused"> Buying Paused </span></v-btn
        >
        <!-- Too low USDC balance -->
        <v-btn
          color="primary"
          class="domainButton"
          v-if="
            isActivated &&
            isNetworkSupported &&
            !getWrapperPaused &&
            !hasUserEnoughUsdc
          "
          @click="approveUsdc"
          :disabled="
            waiting ||
            buyNotValid(chosenDomainName).invalid ||
            !hasUserEnoughUsdc
          "
        >
          <span style="color: #ffffff"
            >Your USDC balance is too low</span
          ></v-btn
        >
        <!-- Approve USDC -->
        <v-btn
          color="primary"
          class="domainButton"
          data-bs-toggle="modal"
          data-bs-target="#approveUsdcModal"
          v-if="
            isActivated &&
            isNetworkSupported &&
            !getWrapperPaused &&
            !hasEnoughUsdcAllowance &&
            hasUserEnoughUsdc
          "
          :disabled="
            waiting ||
            buyNotValid(chosenDomainName).invalid ||
            !hasUserEnoughUsdc
          "
        >
          <span
            v-if="waiting"
            class="spinner-border spinner-border-sm mx-1"
            role="status"
            aria-hidden="true"
          ></span>
          <span style="color: #ffffff">Approve USDC </span></v-btn
        >
        <!-- Buy domain -->
        <v-btn
          v-if="isActivated && isNetworkSupported && !getWrapperPaused && hasEnoughUsdcAllowance && hasUserEnoughUsdc"
          @click="buyDomain"
          :disabled="waiting || buyNotValid(chosenDomainName).invalid || !hasUserEnoughUsdc"
          color="primary"
          class="domainButton"
        >
          <span v-if="waiting" class="spinner-border spinner-border-sm mx-1" role="status" aria-hidden="true"></span>
          <span style="color: #ffffff"> Buy domain </span></v-btn
        >
        <!-- Connect Wallet -->
        <v-btn
          v-if="!isActivated"
          @click="open"
          color="primary"
          class="domainButton"
        >
          <span style="color: #ffffff"> Connect Wallet </span></v-btn
        >
        <!-- Wrong Network -->
        <v-btn
          v-if="isActivated && !isNetworkSupported"
          @click="changeNetwork('Polygon')"
          color="primary"
          class="domainButton"
        >
          <span style="color: #ffffff"> Switch to Polygon </span></v-btn
        >
      </v-row>
    </v-col>
  </v-row>
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
import { ethers } from "ethers";
import { useBoard, useEthers } from "vue-dapp";
import { mapActions, mapGetters, mapMutations } from "vuex";
import { useToast, TYPE } from "vue-toastification";
import WaitingToast from "../components/toasts/WaitingToast.vue";
import Referral from "../components/Referral.vue";
import useDomainHelpers from "../hooks/useDomainHelpers";
import useChainHelpers from "../hooks/useChainHelpers";
import KlimaPunkDomainsAbi from "../abi/KlimaPunkDomains.json";
import erc20Abi from "../abi/Erc20.json";

export default {
  name: "Home",

  data() {
    return {
      chosenDomainName: null,
      chosenAllowance: null,
      loading: false, // loading data
      retirementMessage: null,
      showRetMsgInput: false,
      waiting: false, // waiting for TX to complete
      wrapperContract: null,
      loveLetterMessage: null,
    };
  },

  components: {
    Referral,
  },

  created() {
    this.chosenAllowance = this.getWrapperTldPrice;
  },

  computed: {
    ...mapGetters("user", [
      "getUsdcAddress",
      "getUsdcAllowance",
      "getUsdcBalance",
    ]),
    ...mapGetters("network", ["getBlockExplorerBaseUrl"]),
    ...mapGetters("klima", [
      "getKlimaWrapperAddress",
      "getKlimaTldContract",
      "getWrapperTldPrice",
      "getWrapperPaused",
    ]),

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
      if (
        this.address &&
        Number(this.getWrapperTldPrice) > 0 &&
        Number(this.getUsdcBalance) > 0
      ) {
        if (Number(this.getUsdcAllowance) >= Number(this.getWrapperTldPrice)) {
          return true;
        }
      }

      return false;
    },

    hasUserEnoughUsdc() {
      if (
        this.address &&
        Number(this.getWrapperTldPrice) > 0 &&
        Number(this.getUsdcBalance) > 0
      ) {
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
    },
  },

  methods: {
    ...mapMutations("user", ["addDomainManually", "setUsdcAllowance"]),

    clickCard() {
      this.yourNameHere = null;
    },

    async approveUsdc() {
      this.waiting = true;

      // USDC contract
      const usdcIntfc = new ethers.utils.Interface(erc20Abi);
      const usdcContractSigner = new ethers.Contract(
        this.getUsdcAddress,
        usdcIntfc,
        this.signer
      );

      try {
        const tx = await usdcContractSigner.approve(
          this.getKlimaWrapperAddress, // spender (wrapper contract)
          ethers.utils.parseUnits(this.chosenAllowance, "mwei") // amount (in mwei, 6 decimals)
        );

        const toastWait = this.toast(
          {
            component: WaitingToast,
            props: {
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.",
            },
          },
          {
            type: TYPE.INFO,
            onClick: () =>
              window
                .open(this.getBlockExplorerBaseUrl + "/tx/" + tx.hash, "_blank")
                .focus(),
          }
        );

        document.getElementById("approveUsdcModal").click(); // close the modal

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast(
            "You have successfully set the allowance! Now proceed with buying the domain.",
            {
              type: TYPE.SUCCESS,
              onClick: () =>
                window
                  .open(
                    this.getBlockExplorerBaseUrl + "/tx/" + tx.hash,
                    "_blank"
                  )
                  .focus(),
            }
          );
          this.setUsdcAllowance(this.chosenAllowance);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () =>
              window
                .open(this.getBlockExplorerBaseUrl + "/tx/" + tx.hash, "_blank")
                .focus(),
          });
          console.log(receipt);
          this.waiting = false;
        }
      } catch (e) {
        console.log(e);
        this.waiting = false;
        this.toast(e.message, { type: TYPE.ERROR });
      }

      this.waiting = false;
    },

    async buyDomain() {
      this.waiting = true;
      const fullDomainName = this.domainLowerCase + ".klima";

      // check if domain already minted
      const existingHolder = await this.getKlimaTldContract.getDomainHolder(
        this.domainLowerCase
      );

      if (existingHolder !== ethers.constants.AddressZero) {
        this.toast("Sorry, but this domain name is already taken...", {
          type: TYPE.ERROR,
        });
        this.waiting = false;
        return;
      }

      // wrapper contract (with signer)
      const wrapperIntfc = new ethers.utils.Interface(KlimaPunkDomainsAbi);
      const wrapperContractSigner = new ethers.Contract(
        this.getKlimaWrapperAddress,
        wrapperIntfc,
        this.signer
      );

      try {
        let referral = localStorage.getItem("referral");

        if (!referral || !ethers.utils.isAddress(referral)) {
          referral = ethers.constants.AddressZero;
        }

        let retMsg;

        if (!this.retirementMessage) {
          retMsg = "";
        } else {
          retMsg = this.retirementMessage + " - via www.kns.earth";
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
              text: "Please wait for your transaction to confirm. Click on this notification to see transaction in the block explorer.",
            },
          },
          {
            type: TYPE.INFO,
            onClick: () =>
              window
                .open(this.getBlockExplorerBaseUrl + "/tx/" + tx.hash, "_blank")
                .focus(),
          }
        );

        const receipt = await tx.wait();

        if (receipt.status === 1) {
          this.toast.dismiss(toastWait);
          this.toast("You have successfully bought the domain!", {
            type: TYPE.SUCCESS,
            onClick: () =>
              window
                .open(this.getBlockExplorerBaseUrl + "/tx/" + tx.hash, "_blank")
                .focus(),
          });
          this.addDomainManually(fullDomainName);
          this.waiting = false;
        } else {
          this.toast.dismiss(toastWait);
          this.toast("Transaction has failed.", {
            type: TYPE.ERROR,
            onClick: () =>
              window
                .open(this.getBlockExplorerBaseUrl + "/tx/" + tx.hash, "_blank")
                .focus(),
          });
          console.log(receipt);
          this.waiting = false;
        }
      } catch (e) {
        console.log(e);
        this.waiting = false;
        this.toast(e.message, { type: TYPE.ERROR });
      }

      this.waiting = false;
    },

    changeNetwork(networkName) {
      const networkData = this.switchNetwork(networkName);

      window.ethereum.request({
        method: networkData.method,
        params: networkData.params,
      });
    },

    showRetMsg() {
      this.showRetMsgInput = true;
    },
  },

  setup() {
    const { open } = useBoard();
    const { address, chainId, isActivated, signer } = useEthers();
    const toast = useToast();
    const { buyNotValid } = useDomainHelpers();
    const { switchNetwork } = useChainHelpers();

    return {
      address,
      buyNotValid,
      chainId,
      isActivated,
      open,
      signer,
      switchNetwork,
      toast,
    };
  },
};
</script>

<style scoped>
h1 {
  font-size: 80px;
  color: #232b2b;
}
.domainSpan {
  font-size: 40px;
}
.domainInput {
  font-size: 40px;
  height: 60px;
  padding-top: 0;
  color: #00cc33;
  border: 0;
  outline: 0;
  width: 100%;
}
::placeholder {
  color: #00cc33;
}
textarea {
  resize: none;
  border: 0;
  outline: 0;
  width: 100%;
  overflow: auto;
}
.domainButton {
  width: 100%;
  height: 50px;
}
textarea::placeholder {
  color: #a1a1a1;
}
textarea::-webkit-scrollbar {
  display: none;
}
.iconImage {
  width: 100%;
  max-height: 50px;
  height: 100%;
}
</style>