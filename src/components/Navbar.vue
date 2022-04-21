<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img
          src="src/assets/KlimaDAO-NS-LOGO.png"
          alt=""
          width="300"
          class="d-inline-block align-bottom navbar-img"
        />
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" style="justify-content:center">
        <router-link to="/profile" > Your Profile </router-link>
        <router-link to="/about"> About KNS </router-link>
        <router-link to="/how"> How Kns Works </router-link>
      </div>

      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <div class="d-flex ms-auto">
          <div v-if="isActivated" class="">
            <div class="btn-group mx-2">
              <v-btn
                color="white"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {{ getNetworkName }}
                <v-icon append>mdi-menu-down</v-icon>
              </v-btn>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <span
                    class="dropdown-item"
                    v-for="network in getSupportedNetworkNames"
                    @click="changeNetwork(network)"
                    >{{ network }}</span
                  >
                </li>
              </ul>
            </div>

            <div class="btn-group mx-2">
              <v-btn
                color="primary"
                type="button"
                aria-expanded="false"
                id="dropdownMenuButton2"
                data-bs-toggle="dropdown"
              >
                {{ getNameOrAddress }}
                <v-icon append>mdi-menu-down</v-icon>
              </v-btn>

              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                <li class="dropdown-item" @click="logout">Disconnect</li>
              </ul>
            </div>
          </div>

          <button v-else class="btn btn-primary" @click="open">
            Connect wallet
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { mapGetters } from "vuex";
import { useBoard, useEthers, useWallet } from "vue-dapp";
import useChainHelpers from "../hooks/useChainHelpers";

export default {
  name: "Navbar",

  computed: {
    ...mapGetters("user", ["getUserShortAddress", "getUserSelectedName"]),
    ...mapGetters("network", [
      "getNetworkName",
      "getSupportedNetworks",
      "getSupportedNetworkNames",
    ]),

    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserShortAddress;
      }
    },
  },

  methods: {
    changeNetwork(networkName) {
      const networkData = this.switchNetwork(networkName);

      window.ethereum.request({
        method: networkData.method,
        params: networkData.params,
      });
    },

    logout() {
      this.disconnect();
      localStorage.clear();
      localStorage.setItem("connected", "null");
    },

    openUrl(url) {
      window.open(url, "_blank").focus();
    },
  },

  setup() {
    const { open } = useBoard();
    const { disconnect } = useWallet();
    const { isActivated } = useEthers();
    const { switchNetwork } = useChainHelpers();

    return {
      isActivated,
      disconnect,
      open,
      switchNetwork,
    };
  },
};
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
}
.navbar-brand {
  /*font-family: 'Cyber', cursive;*/
}
.navbar-dark .navbar-brand {
  color: black;
}

.navbar-dark {
  border-radius: 0px 0px 10px 10px;
  padding: 20px;
  border-top-color: black;
}
.navbar-img {
  margin-right: 5px;
  color: #dbdfea;
}

#navbarSupportedContent {
  flex-grow: inherit;
}

a {
  margin-right: 6%;
}
</style>
