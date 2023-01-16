<template>
  <ErrorComponent :text="errorMessage" />
  <router-view></router-view>
</template>

<script>
import ErrorComponent from './components/ErrorComponent.vue';
import { mapWritableState } from 'pinia';
import { useState } from './state';

const channelRoute =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:9000'
    : 'wss://vast-headland-57022.herokuapp.com';

export default {
  name: 'App',
  data() {
    return {
      keepAliveInterval: null
    }
  },
  components: {
    ErrorComponent,
  },
  computed: {
    ...mapWritableState(useState, [
      'channel',
      'isLoading',
      'player',
      'introductionText',
      'errorMessage',
      'board',
      'gameState',
      'currentPlayer',
    ]),
  },
  created() {
    this.channel = new WebSocket(channelRoute);
    this.onChannel();

  },
  methods: {
    restartChannel() {
      console.log("restarting channel")
      if (this.$route.name !== 'home') {
        this.$router.push({ name: 'home' });
      }
      clearInterval(this.keepAliveInterval)
      this.isLoading = true;
      this.errorMessage = '';
      this.board = null;
      this.gameState = '';
      this.currentPlayer = '';
      this.introductionText = '';
      this.channel.close();
      this.channel = new WebSocket(channelRoute);
      this.onChannel();

    },
    onChannel() {
      this.channel.onopen = (event) => {
        console.info('Connected to channel', event);
        this.keepAliveInterval = setInterval(() => {
          this.channel.send(JSON.stringify({ keepAlive: true }));
        }, 5000);
      };

      this.channel.onclose = (event) => {
        console.info('Disconnected from channel', event);
        this.restartChannel();
      };

      this.channel.onerror = (error) => {
        console.error('An error occured in the channel: ', error);
        this.channel.send(
          JSON.stringify({
            command: 'q',
          })
        );
        this.restartChannel();
      };

      this.channel.onmessage = (e) => {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          console.log('data received', data);
          switch (data.event) {
            case 'GAME_INTRODUCTION':
              this.introductionText = data.introductionText;
              this.isLoading = false;
              break;
            case 'WAITING_FOR_SECOND_PLAYER':
              this.isLoading = true;
              break;
            case 'GAME_PLAYING':
              this.errorMessage = data.errorMessage;
              this.board = data.board;
              this.gameState = data.gameState;
              this.currentPlayer = data.currentPlayer;
              if (this.$route.name === 'home') {
                this.$router.push({ name: 'mill' });
              }
              this.isLoading = false
              break;
            case 'GAME_QUIT':
              this.restartChannel();
              break;
            default:
              console.error('Unknown event!');
          }
        }
      };
    },
  },
};
</script>

<style lang="scss">
@import '@/assets/stylesheets/main';
</style>
