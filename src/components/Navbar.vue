<template>
  <nav class="navbar sticky-top navbar-expand-lg navbar-light">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">
        <img src="../assets/KlimaDAO-NS-LOGO.png" alt="KlimaDAO Name Service" 
            height="105" width="275" class="d-inline-block align-bottom navbar-img">
      </router-link>
      <div class="legend-div">
      <router-link to="/profile" class="d-inline-block navbar-legend">
        YOUR PROFILE
      </router-link>

      <router-link to="/about" class="d-inline-block navbar-legend">
        ABOUT KNS
      </router-link>

      <router-link to="/how" class="d-inline-block navbar-legend">
        HOW KNS WORKS
      </router-link>
      </div>



      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        
        <div class="d-flex flex-row ms-auto">
          <div v-if="isActivated" class="">
          
            <div class="btn-group mx-2">
              <button class="btn btn-primary btn-Network dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                {{getNetworkName}}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                <li>
                  <span 
                    class="dropdown-item" 
                    v-for="network in getSupportedNetworkNames"
                    @click="changeNetwork(network)"
                  >{{network}}</span>
                </li>
              </ul>
            </div>

            <div class="btn-group mx-2">
              <button class="btn btn-primary btn-connectedName dropdown-toggle" type="button" id="dropdownMenuButton2" data-bs-toggle="dropdown" aria-expanded="false">
                {{ getNameOrAddress }}
              </button>
              <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton2">
                <router-link tag="li" class="dropdown-item" to="/profile">Profile</router-link>
                <router-link tag="li" class="dropdown-item" to="/">Buy domain</router-link>
                <router-link tag="li" class="dropdown-item" to="/search-domain">Search domain</router-link>
                <router-link tag="li" class="dropdown-item" to="/send-tokens">Send tokens</router-link>
                <router-link tag="li" class="dropdown-item" to="/about">About</router-link>
                <router-link tag="li" class="dropdown-item" to="/how">How it works</router-link>
                <router-link tag="li" class="dropdown-item" to="/browser">Browser extension</router-link>
                <li class="dropdown-item" @click="logout">Disconnect</li>
              </ul>
            </div>
          </div>

          <button v-else class="btn btn-primary btn-unConnected" @click="open">Connect wallet</button>
        </div>

      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { useBoard, useEthers, useWallet } from 'vue-dapp';
import useChainHelpers from "../hooks/useChainHelpers";

export default {
  name: "Navbar",

  computed: {
    ...mapGetters("user", ["getUserShortAddress", "getUserSelectedName"]),
    ...mapGetters("network", ["getNetworkName", "getSupportedNetworks", "getSupportedNetworkNames"]),

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
        params: networkData.params
      });
    },

    logout() {
      this.disconnect();
      localStorage.clear();
      localStorage.setItem("connected", "null");
    },

    openUrl(url) {
      window.open(url, '_blank').focus();
    }
  },
  
  setup() {
    const { open } = useBoard();
    const { disconnect } = useWallet();
    const { isActivated } = useEthers();
    const { switchNetwork } = useChainHelpers();

    return {
      isActivated, disconnect, open, switchNetwork
    }
  }
}
</script>

<style scoped>
.dropdown-item {
  cursor: pointer;
}

.legend-div { 
  float:left;
  padding-left:5%;
  width:40%;
  display: flex;
  align-items:stretch;
  justify-content: space-around;
}

.legend-div .navbar-legend {
  color: #4A4A4A;
  font-weight: normal;
  font-size: 16px;
  text-align: center;
  padding: 10px;

}

.navbar-brand {
  /*font-family: 'Cyber', cursive;*/
}
.navbar-light .navbar-brand {
  color: #4A4A4A;
}
.navbar-light {
  height:146px;
  background: #FFFFFF;
  border-radius: 0px 0px 10px 10px;
  padding: 10px;
  
}
.navbar-img {
  margin-right: 5px;
  color: #DBDFEA;
}

.btn-connectedName,  .btn-connectedName:active, 
        .btn-connectedName:focus, .btn-connectedName:disabled {
  background: #00CC33;
  border-color: #00CC33;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #FFFFFF;
}

.btn-connectedName:hover {
  background: #00CC33;
  border-color: #4A4A4A;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #FFFFFF;
}

.btn-Network,  .btn-Network:active, 
        .btn-Network:focus, .btn-Network:disabled {
  background: transparent;
  border-color: #00CC33;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #4A4A4A;
  font-size: 16px;
  font-weight: bold;
}

.btn-Network:hover {
  background: #00CC33;
  border-color: #4A4A4A;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #FFFFFF;
}

.btn-unConnected,  .btn-unConnected:active, 
        .btn-unConnected:focus, .btn-unConnected:disabled {
  background: #A1A1A1;
  border-color: #00CC33;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #FFFFFF;
}

.btn-unConnected:hover {
  background: #00CC33;
  border-color: #00CC33;
  border-width: 1px;
  border-radius: 13px;
  box-shadow: none;
  color: #FFFFFF;
}

@media screen and (max-width:600px) {

}

</style>
