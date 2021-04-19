<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="szeSzaKod"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Számlák hó végi egyenlege</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-menu
                    offset-x
                    v-model="menu"
                    :close-on-content-click="false"
                    :nudge-right="10"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">{{ formatEditDate }}</v-btn>
                    </template>
                    <v-date-picker
                        width="200"
                        v-model="formatPickerInput"
                        locale="hu-HU"
                        :max="new Date('2021-03-31').toISOString().substr(0, 10)"
                        :min="new Date('1998-04-01').toISOString().substr(0, 10)"
                        @input="menu = false"
                        type="month"
                    ></v-date-picker>
                </v-menu>
                <v-toolbar-title class="ml-3">(kiválasztott hónap)</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
        </template>
    </v-data-table>
</template>

<script>
    import moment from 'moment';
    export default {
        created () {
            this.initialize();
        },
        data: () => ({
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Számla', 
                    value: 'szeSzaKod',
                    width: '7%',
                },
                {   text: 'Számlanév', 
                    value: 'szeSzaMegnev',
                    width: '12%',
                },
                {   text: 'Típus', 
                    value: 'szeSzaSzlatip',
                    width: '6%',
                },
                {   text: 'Típus megnevezése', 
                    value: 'szeSzaSzlatipNev',
                    width: '12%',
                },
                {   text: 'Pénzintézet', 
                    value: 'szeSzaPenzint',
                    width: '8%',
                },
                {   text: 'Pénzintézet neve', 
                    value: 'szeSzaPenzintNev',
                    width: '12%',
                },
                {   text: 'Deviza', 
                    value: 'szeSzaDeviza',
                    width: '7%',
                },
                {   text: 'Deviza neve', 
                    value: 'szeSzaDevizaNev',
                    width: '12%',
                },
                {   text: 'Egyenleg', 
                    value: 'szeEgyenleg',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Árfolyam', 
                    value: 'szeArfolyam',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Árf. érték', 
                    value: 'szeArfolyamErtek',
                    align: 'end',
                    width: '8%',
                },
            ],
            kivHonap: '',
            menu: false,                                    // A MonthPicker mint menü megjelenítés vezérlője
            tetelek: [],                                    // A táblázat tétel adatai
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    this.kivHonap = moment(new Date()).format('YYYY-MM');
                    this.szamlaEgyenlegekFormUpdate(this.kivHonap);
                } catch(e) {
                    alert(e)
                }
            },
            async szamlaEgyenlegekFormUpdate(honap) {       // Táblázat feltöltése az adott év bevételeivel
                try {
                    const szamlaEgyenlegek = await this.$axios.get('http://localhost:8080/kimutatasok/haviegyenlegek/' + honap);
                    this.tetelek = szamlaEgyenlegek.data;
                } catch(e) {
                    alert(e)
                }
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
        },
        computed: {
            formatEditDate() {                              // Editált dátumérték megjelenítése
                    let ret = this.kivHonap;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0,4) + "." + ret.substr(5,7);
                        }
                    }
                    return ret;
            },
            formatPickerInput: {                            // A MonthPicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A MonthPicker input-ját adja vissza az editált mezőértékből
                    let ret = this.kivHonap;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 7);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    if (!(this.kivHonap === value)) {
                        this.kivHonap = value;
                        this.szamlaEgyenlegekFormUpdate(this.kivHonap);
                    }
                },
            },
        },
        watch: {
        },
    }
</script>

<style>
</style>
