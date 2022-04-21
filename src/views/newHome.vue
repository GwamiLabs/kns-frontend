<template>
  <v-row>
    <v-col xs="3" sm="3" md="3" lg="3" xl="3">
      <v-container style="margin-left: 30px">
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
              ><v-img class="iconImage" src="src/assets/social-medium-icon.png"></v-img>
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
          <v-col rows=6 > </v-col>
        </v-row>
      </v-container>
    </v-col>
    <v-col cols="8">
        <v-row style="margin:2%">
            <v-card variant="outlined" style="width: 100%; height:100%; border-color:#A1A1A1" >
                        <v-row justify="space-between" style="margin:1px" @click="clickCard">
                            <v-col cols="9">
                <input placeholder="Your name here" v-model="chosenDomainName" class="domainInput"  />
                            </v-col>
                            <v-col cols="2" justify="end">
                <span class="domainSpan" style="color:#232B2B;text-align:end">.klima</span>
                            </v-col>
                        </v-row>
            </v-card>
        </v-row>
                <v-row style="margin:2%">
            <v-card variant="outlined" style="width: 100%; height:100%; border-color:#A1A1A1" >
                        <v-row justify="space-between" style="margin:2%" @click="clickCard">

                            <textarea type="text" no-resize v-model="loveLetterMessage" variant="solo" placeholder="bonus perk"></textarea>
                
                        </v-row>
            </v-card>
        </v-row>

         </v-col>
                                 <v-col cols="1" > </v-col>

  </v-row>
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
      loveLetterMessage: null
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
    font-size:40px;
}
.domainInput {
    font-size:40px;
    height:60px;
    padding-top:0;
    color:#00CC33;
    border:0;
    outline:0;
    width:100%;
}
p {
}

::placeholder {
    color:#00CC33;
}
.iconImage {
  width: 100%;
  max-height:50px;
  height: 100%;
}
</style>