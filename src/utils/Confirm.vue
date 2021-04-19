<template>
    <v-row justify="center">
        <v-dialog
                persistent
                v-model="enable"
                :max-width="dialogWidth"
        >
            <v-card color="yellow">
                <v-card-title class="headline">{{ titleData }}</v-card-title>
                <v-card-text>{{ getCardText }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="green darken-1"
                        @click="nemChoice"
                    >
                        Nem
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        @click="igenChoice"
                    >
                        Igen
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
</template>

<script>
    var Util = require('./Util.js');
    export default {
        props: {
            mode: {
                type: String
            },
            dialog: {
                type: Boolean
            }
        },
        methods: {
            igenChoice() {
                this.$emit('IgenValasz');
            },
            nemChoice() {
                this.$emit('NemValasz');
            }
        },
        computed: {
            enable: function() {
                return this.dialog;
            },
            dialogWidth: function() {
                var ret;
                if (this.mode === 'F') {
                    ret = Util.okeWidth;
                } else if (this.mode === 'K') {
                    ret = Util.szKonyvWidth;
                } else if (this.mode === 'L') {
                    ret = Util.szKonyvTorlWidth;
                } else if (this.mode === 'H') {
                    ret = Util.haKonyvWidth;
                } else if (this.mode === 'I') {
                    ret = Util.haKonyvTorlWidth;
                } else { // (this.mode === 'T')
                    ret = Util.torlWidth;
                }
                return ret;
            },
            titleData: function() {
                var ret;
                if (this.mode === 'F') {
                    ret = Util.ELFOGAD;
                } else if (this.mode === 'K') {
                    ret = Util.szKonyvKerd;
                } else if (this.mode === 'L') {
                    ret = Util.szKonyvTorlKerd;
                } else if (this.mode === 'H') {
                    ret = Util.haKonyvKerd;
                } else if (this.mode === 'I') {
                    ret = Util.haKonyvTorlKerd;
                } else { // (this.mode === 'T')
                    ret = Util.TORLES;
                }
                return ret;
            },
            getCardText: function() {
                var ret;
                if (this.mode === 'F') {
                    ret = Util.okeSzoveg;
                } else if (this.mode === 'K') {
                    ret = Util.szKonyvSzoveg;
                } else if (this.mode === 'L') {
                    ret = Util.szKonyvTorlSzoveg;
                } else if (this.mode === 'H') {
                    ret = Util.haKonyvSzoveg;
                } else if (this.mode === 'I') {
                    ret = Util.haKonyvTorlSzoveg;
                } else { // (this.mode === 'T')
                    ret = Util.torlSzoveg;
                }
                return ret;
            }
        },
        data () {
            return {
            }
        }
    }
</script>

<style>
</style>
