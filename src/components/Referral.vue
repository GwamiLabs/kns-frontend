<template>
  <div class="row">
    <div class="col-md-12 mt-3">
      <div class="container text-center">
        <p>
          <strong>Referrals</strong> 
          Share this referral link and earn rewards from new domain mints!
        </p>

        <div class="row mt-1">
          <input 
            class="form-control text-center clipboard"
            :value="'http://www.kns.earth/?ref=' + this.getNameOrAddress"
            @click="copyToClipboard('http://www.kns.earth/?ref=' + this.getNameOrAddress)"
            readonly
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { useToast, TYPE } from "vue-toastification";

export default {
  name: "Referral",

  computed: {
    ...mapGetters("user", ["getUserAddress", "getUserSelectedName"]),
    
    getNameOrAddress() {
      if (this.getUserSelectedName) {
        return this.getUserSelectedName;
      } else {
        return this.getUserAddress;
      }
    }
  },

  methods: {
    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      this.toast("Referral link copied to your clipboard!", {type: TYPE.SUCCESS});
    }
  },

  setup() {
    const toast = useToast();

    return { toast }
  },
}
</script>

<style scoped>
.clipboard {
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  color:#4a4a4a;
  width: 100%;
  padding-top:10px;
  padding-bottom: 10px;
  background-color: transparent;
  border-color: #a1a1a1;
  border: 1px;
}
</style>