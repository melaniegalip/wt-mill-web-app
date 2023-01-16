import { defineStore } from 'pinia';

export const useState = defineStore('state', {
  state: () => ({
    channel: null,
    isLoading: true,
    player: null,
    introductionText: '',
    errorMessage: '',
    board: null,
    gameState: '',
    currentPlayer: '',
  }),
});
