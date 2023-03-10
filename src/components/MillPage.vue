<template>
  <div id="mill" :class="{ 'non-interactable': isLoading }">
    <div class="board-container">
      <div class="board">
        <b-alert show variant="light" id="game-state"
          ><h2>
            <pre>{{ currentPlayer }}'s turn: {{ gameState }}</pre>
          </h2></b-alert
        >
        <div
          v-for="ring in board.size"
          :key="'ring-' + ring"
          class="ring"
          :class="'w-' + ring"
        >
          <div
            v-for="row in board.size"
            :key="'row-' + row"
            class="field-row"
          >
            <template v-for="col in board.size" :key="'col-' + col">
              <span
                v-if="getField(col - 1, row - 1, ring - 1)"
                class="field"
                :class="{
                  active: getField(col - 1, row - 1, ring - 1).equals(
                    from
                  ),
                  'non-interactable':
                    player.displayName === currentPlayerName,
                }"
                @click="
                  () => onTurn(getField(col - 1, row - 1, ring - 1))
                "
              >
                {{ getField(col - 1, row - 1, ring - 1).color }}
              </span>
            </template>
          </div>
        </div>
        <div class="loading-indicator" :class="{ show: isLoading }">
          <b-spinner label="Loading..."></b-spinner>
        </div>
      </div>
      <div class="actions">
        <b-button
          v-model="save"
          @click="saveOrLoad"
          size="lg"
          :variant="save ? 'success' : 'primary'"
          >{{ save ? 'Save' : 'Load' }}</b-button
        >
        <b-button @click="quit" size="lg" variant="danger"
          >Quit</b-button
        >
        <b-button @click="newGame" size="lg" variant="primary"
          >New Game</b-button
        >
      </div>
    </div>
  </div>
</template>
<script>
import { mapState, mapWritableState } from 'pinia';
import { useState } from '../state';
import Field from './field.js';

export default {
  name: 'MillPage',
  data() {
    return {
      from: null,
      save: true,
    };
  },
  computed: {
    ...mapState(useState, [
      'gameState',
      'currentPlayer',
      'board',
      'channel',
      'player'
    ]),
    ...mapWritableState(useState, ['isLoading']),
    currentPlayerName() {
      return this.currentPlayer.split(' ')[0];
    },
  },
  methods: {
    onAction(command) {
      this.isLoading = true;
      this.channel.send(JSON.stringify(command));
    },
    setOrRemove(to) {
      this.onAction({
        command: to.representation,
      });
      this.from = null;
    },
    move(to) {
      this.onAction({
        command: `${this.from.representation} ${to.representation}`,
      });
      this.from = null;
    },
    saveOrLoad() {
      this.onAction({
        command: this.save ? 's' : 'l',
      });
      this.save = !this.save;
    },
    quit() {
      this.onAction({
        command: 'q',
      });
    },
    newGame() {
      this.onAction({
        command: 'n',
      });
    },
    getField(col, row, ring) {
      const field = this.board.fields.find(
        (f) => f.x === col && f.y === row && f.ring === ring
      );
      return !field ? field : new Field(field);
    },
    onTurn(field) {
      if (field.isSet) {
        if (
          this.gameState === 'Removing Pieces' ||
          this.gameState === 'Setting Pieces'
        ) {
          this.setOrRemove(field);
        } else {
          if (!this.from) {
            this.from = field;
          } else {
            this.move(field);
          }
        }
      } else {
        if (this.from) {
          this.move(field);
        } else {
          this.setOrRemove(field);
        }
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'bootstrap/scss/bootstrap-utilities';
@import '@/assets/stylesheets/mill';
</style>
