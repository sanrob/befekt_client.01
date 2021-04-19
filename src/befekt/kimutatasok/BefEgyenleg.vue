<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="beeBffKod"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Befektetések napi egyenlege</v-toolbar-title>
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
                        width="300"
                        v-model="formatPickerInput"
                        locale="hu-HU"
                        :max="new Date('2021-03-31').toISOString().substr(0, 10)"
                        :min="new Date('1998-04-01').toISOString().substr(0, 10)"
                        @input="menu = false"
                    ></v-date-picker>
                </v-menu>
                <v-toolbar-title class="ml-3">(kiválasztott nap)</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
        </template>
        <template v-slot:item.beeDarab="{ item }">
            <span>{{ formatNumber(item.beeDarab) }}</span>
        </template>
        <template v-slot:item.beeArfDatum="{ item }">
            <span>{{ formatDate(item.beeArfDatum) }}</span>
        </template>
        <template v-slot:item.beeArfolyam="{ item }">
            <span>{{ formatNumberArf(item.beeArfolyam) }}</span>
        </template>
        <template v-slot:item.beeArfErtek="{ item }">
            <span>{{ formatNumber(item.beeArfErtek) }}</span>
        </template>
        <template v-slot:item.beeDevArfo="{ item }">
            <span>{{ formatNumber(item.beeDevArfo) }}</span>
        </template>
        <template v-slot:item.beeAlapdevErtek="{ item }">
            <span>{{ formatNumberAlap(item.beeAlapdevErtek) }}</span>
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
                {   text: 'Kód', 
                    value: 'beeBffKod',
                    width: '5%',
                },
                {   text: 'Befektetés megnevezése', 
                    value: 'beeBffKodNev',
                    width: '24%',
                },
                {   text: 'Darabszám', 
                    value: 'beeDarab',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Árf. dátuma',
                    value: 'beeArfDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '12%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Árfolyam', 
                    value: 'beeArfolyam',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Árf.Érték', 
                    value: 'beeArfErtek',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Dev.', 
                    value: 'beeSzaDeviza',
                    width: '7%',
                },
                {   text: 'Deviza neve', 
                    value: 'beeSzaDevizaNev',
                    width: '10%',
                },
                {   text: 'Dev.Árf.', 
                    value: 'beeDevArfo',
                    align: 'end',
                    width: '8%',
                },
                {   text: 'Alapdev. érték', 
                    value: 'beeAlapdevErtek',
                    align: 'end',
                    width: '10%',
                },
            ],
            kivHonap: '',
            menu: false,                                    // A MonthPicker mint menü megjelenítés vezérlője
            tetelek: [],                                    // A táblázat tétel adatai
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    this.kivHonap = moment(new Date()).format('YYYY-MM-DD');
                    this.befektEgyenlegekFormUpdate(this.kivHonap);
                } catch(e) {
                    alert(e)
                }
            },
            async befektEgyenlegekFormUpdate(honap) {       // Táblázat feltöltése az adott év bevételeivel
                try {
                    const szamlaEgyenlegek = await this.$axios.get('http://localhost:8080/kimutatasok/befektegyenlegek/' + honap);
                    this.tetelek = szamlaEgyenlegek.data;
                } catch(e) {
                    alert(e)
                }
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                if (Math.round(number) === 0) {
                    return '';
                }
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                if (date) {
                    return moment(date).format('YYYY.MM.DD');
                }
                return '';
            },
            formatNumberArf(number) {                       // Táblázatban összegmező formázott megjelenítése
                if (Math.round(parseFloat(number) * Math.pow(10, 6)) / Math.pow(10, 6) === 0) {
                    return '';
                }
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 6, maximumFractionDigits: 6});
            },
            formatNumberAlap(number) {                      // Táblázatban összegmező formázott megjelenítése
                if (Math.round(number) === 0) {
                    return '';
                }
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 0, maximumFractionDigits: 0});
            },
        },
        computed: {
            formatEditDate() {                              // Editált dátumérték megjelenítése
                    let ret = this.kivHonap;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 4) + "." + ret.substr(5, 2) + "." + ret.substr(8, 2);
                        }
                    }
                    return ret;
            },
            formatPickerInput: {                            // A MonthPicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A MonthPicker input-ját adja vissza az editált mezőértékből
                    let ret = this.kivHonap;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    if (!(this.kivHonap === value)) {
                        this.kivHonap = value;
                        this.befektEgyenlegekFormUpdate(this.kivHonap);
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
