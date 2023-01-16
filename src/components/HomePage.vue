<template>
  <div id="home">
    <b-card
      footer-bg-variant="white"
      footer-border-variant="white"
      title="Welcome to Mill!"
      style="position: relative"
    >
      <b-card-text>
        <pre>{{ introductionText }}</pre>
        <div class="loading-indicator" :class="{ show: isLoading }">
          <b-spinner label="Loading..."></b-spinner>
        </div>
      </b-card-text>
      <b-card-footer :class="{ 'non-interactable': isLoading }">
        <div class="row" @click="onSignIn">
          <div class="col-md-4">
            <a
              class="btn btn-outline-dark"
              role="button"
              style="text-transform: none"
            >
              <img
                style="margin-bottom: 3px; margin-right: 5px; width:20px;"
                alt="Google sign-in"
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
              />
              Login with Google
            </a>
          </div>
        </div>
      </b-card-footer>
    </b-card>
  </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useState } from '../state';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';

export default {
  name: 'HomePage',
  computed: {
    ...mapState(useState, [
      'channel',
      'introductionText',
    ]),
    ...mapWritableState(useState, ['player', 'isLoading']),
  },
  methods: {
    onSignIn() {
      const provider = new GoogleAuthProvider();
      const auth = getAuth();
      auth.languageCode = 'de';
      provider.setCustomParameters({
        login_hint: 'user@gmail.com',
      });
      signInWithPopup(auth, provider)
        .then((result) => {
          if (!result) return
          // This gives you a Google Access Token. You can use it to access the Google API.
          const user = result.user;
          this.player = user;
          this.channel.send(
            JSON.stringify({
              playerName: user.displayName,
            })
          );
          // ...
        }).catch((error) => {
          // The AuthCredential type that was used.
          const credential =
            GoogleAuthProvider.credentialFromError(error);
          console.error(error, credential);
        });
    },
  },
};
</script>
<style lang="scss" scoped>
@import '@/assets/stylesheets/home';
</style>
