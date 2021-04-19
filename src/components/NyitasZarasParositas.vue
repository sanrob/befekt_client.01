<template>
    <div>
        <v-dialog
            persistent
            v-model="dialogNyitZarOpen"
            max-width="1200px"
        >
            <v-data-table
                :headers="headers"
                :items="eddigiParok"
                sort-by="parNyitDatum"
                class="elevation-10"
                dense
                :page.sync="pagination.current"
            >
                <template v-slot:top>
                    <v-toolbar 
                        dense 
                        flat 
                        color="yellow"
                    >
                        <v-toolbar-title>Párosítás nyitási tétellel</v-toolbar-title>
                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>
                        <span>{{ zaroAzonosito | VMask('N-NNNN/NNNNN') }}</span>
                        <span>({{ befektetesKod }} - {{ befektetesMegnev }}:   </span>
                        <span>{{ formatZarasDarabszam }} db, {{ formatParosDarabszam }} páros)</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" class="mb-2" @click="bezaras">Bezárás</v-btn>
                    </v-toolbar>
                </template>
                <template v-slot:item.parNyitAzon="{ item }">
                    <span>{{ item.parNyitAzon | VMask('N-NNNN/NNNNN') }}</span>
                </template>
                <template v-slot:item.parNyitDatum="{ item }">
                    <span>{{ formatDate(item.parNyitDatum) }}</span>
                </template>
                <template v-slot:item.parNyitDarab="{ item }">
                    <span>{{ formatNumber(item.parNyitDarab) }}</span>
                </template>
                <template v-slot:item.parParositott="{ item }">
                    <span>{{ formatNumber(item.parParositott) }}</span>
                </template>
                <template v-slot:item.parDarab="{ item }">
                    <span>{{ formatNumber(item.parDarab) }}</span>
                </template>
                <template v-slot:item.parZarDatum="{ item }">
                    <span>{{ formatDate(item.parZarDatum) }}</span>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                small
                                class="mr-1"
                                @click="parositas(item)"
                                v-bind="attrs"
                                v-on="on"
                            >
                                mdi mdi-alpha-p-box
                            </v-icon>
                        </template>
                        <span>Párosítás nyitási pozícióval</span>
                    </v-tooltip>
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                small
                                class="mr-1"
                                @click="hozambeallitas(item)"
                                v-bind="attrs"
                                v-on="on"
                            >
                                mdi mdi-alpha-h-box
                            </v-icon>
                        </template>
                        <span>Hozam beállítás</span>
                    </v-tooltip>
                </template>
            </v-data-table>
        </v-dialog>
        <confirm
            :mode="confirmMode" 
            :dialog="confirmOpen"
            @IgenValasz="igenValasz"
            @NemValasz="confirmBezar">
        </confirm>
        <v-dialog
            persistent
            v-model="dialog"
            max-width="500px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">Most párosítandó darabszám megadása</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="caption">A két jelzett érték egyikénél sem lehet nagyobb!</span>
                </v-card-subtitle>
                <v-card-text>
                    <v-form
                        v-model="formValid"
                        ref="form"
                    >
                        <v-container>
                            <v-row>
                                <v-col cols="4">
                                    <v-currency-field 
                                        label="Max nyitó párosítható" 
                                        readonly
                                        v-model="maxNyitPar"/>
                                </v-col>
                                <v-col cols="4">
                                    <v-currency-field 
                                        label="Max záró párosítható" 
                                        readonly
                                        v-model="maxZarPar"/>
                                </v-col>
                                <v-col cols="4">
                                    <v-currency-field 
                                        label="Most párosítandó" 
                                        :rules="rulesOsszegAdat"
                                        :error-messages="errors.rate"
                                        v-model="mostParDarab"/>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn 
                        color="blue darken-1" 
                        text 
                        @click="close">
                        Mégse
                    </v-btn>
                    <v-btn 
                        color="blue darken-1" 
                        text 
                        @click="save">
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <hozam-beallitas
            :hozamBeallDialogOpen="hozamBeallDialogOpen"
            :tartKovSzamlak="szamlak"
            :hozamBeallitoRec="hozamBeallito"
            @HozamBeallitoDialogBezar="hozamBeallitoDialogBezar"
            @HozamBeallitoUjraOlvas="hozamBeallitoUjraOlvas"
        >
        </hozam-beallitas>
    </div>
</template>

<script>
 
//            :dialog="confirmOpen"
//            @IgenValasz="igenValasz"
//            @NemValasz="confirmBezar"
    import moment from 'moment';
    import Confirm from '../utils/Confirm.vue';
    import HozamBeallitas from './HozamBeallitas.vue';
    export default {
        props: {
            dialogNyitZarOpen:  {type: Boolean},
            zaroAzonosito:      {type: String},
            befektetesKod:      {type: String},
            befektetesMegnev:   {type: String},
            zarasDarabszam:     {type: Number},
            eddigiParok:        {type: Array},
            parosDarabszam:     {type: Number},
        },
        components: {
            confirm: Confirm,
            hozamBeallitas: HozamBeallitas,
        },
        methods: {
            hozamBeallitoDialogBezar() {
                this.hozamBeallDialogOpen = false;
            },
            bezaras() {
                this.$emit('NyitZarPanelBezarasUpdateFalse');
            },
            parositas(item) {
                this.editItem = item;
                this.maxNyitPar = item.parNyitDarab - item.parParositott + item.parDarab;
                this.maxZarPar = this.zarasDarabszam - this.parosDarabszam + item.parDarab;
                this.mostParDarab = item.parDarab != 0 ? item.parDarab : Math.min(this.maxNyitPar, this.maxZarPar);
                this.dialog = true;
            },
            close() {
                this.dialog = false;
            },
            save () {                                       // OK gombra végrehajtandó
                if (this.$refs.form.validate()) {           //Csak ha Form tartalma valid
                    this.confirmMode = 'F';
                    this.confirmOpen = true;                // Megnyílik a confirm-áló panel.
                }
            },
            confirmBezar: function() {                      // Confirm-áló ablak bezárása.
                this.confirmOpen = false;
            },
            igenValasz() {                                  // Confirm panelen: Új tétel fölvétele/Régi módosítása
                this.confirmBezar();
                this.editItem.parDarab = this.mostParDarab;
                this.editItem.parZarAzon = this.zaroAzonosito;
                this.parositasVegrahajtasa();
            },
            async parositasVegrahajtasa() {                 // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektzarasok/parositas', this.editItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.$emit('NyitZarPanelBezarasUpdateTrue');
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async hozambeallitas(item) {
                this.itemHozambeallitashoz = item;
                item.id;
/*
                this.zarAzon = item.bezAzon;
                this.befKod = item.bezBffKod
                this.befKodNev = item.bezBffKodNev
                this.zarDarab = item.bezDarab
                this.parDarab = item.bezParDarab
*/
                try {
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas');
                    this.szamlak = szamlakRes.data;
                    const hozamBeallitoRet = await this.$axios.get('http://localhost:8080/befektzarasok/hozambeallito/' + item.id);
//                    alert(JSON.stringify(hozamBeallitoRet));
                    this.hozamBeallito = hozamBeallitoRet.data;
//                    alert(JSON.stringify(this.hozamBeallito));
                } catch(e) {
                    alert(e)
                }
                this.hozamBeallDialogOpen = true;
            },
            hozamBeallitoUjraOlvas() {
                this.hozamBeallitoDialogBezar();
                this.hozambeallitas(this.itemHozambeallitashoz);
            },
            pozitivSzam(v) {
                return this.pozitivE(v, 2);
            },
            pozitivE(v, n) {                                // Formázott szám pozitív értékű-e, adott pontosságon
                let ret = false;
                let val = v.toString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n);
                if (val >= 0) {
                    ret = true;
                }
                return ret;
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return date ? moment(date).format('YYYY.MM.DD') : null;
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                return number ? number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2}) : null;
            },
        },
        computed: {
            formatZarasDarabszam() {                        // Táblázatban összegmező formázott megjelenítése
                return this.zarasDarabszam.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            formatParosDarabszam() {                        // Táblázatban összegmező formázott megjelenítése
                return this.parosDarabszam.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            rulesOsszegAdat () {                            // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Negatív összeg érték nem megengedett!';
                const rule3 = v => (v && this.mostParDarab <= this.maxNyitPar) || 'Nem lehet nagyobb, a nyitási tétel még nem párosított darabszámánál!';
                const rule4 = v => (v && this.mostParDarab <= this.maxZarPar) || 'Nem lehet nagyobb, a zárási tétel még nem párosított darabszámánál!';
                rules.push(rule1);
                rules.push(rule2);
                rules.push(rule3);
                rules.push(rule4);
                return rules;
            },
        },
        data: () => ({
            szamlak: [],                                    // Tartozik és követel számlák lista elemei
            hozamBeallito: {},
            pagination: {
            },
            uzenetText: "",                                 // Üzenet dialog szövege
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Nyitási azonosító', 
                    value: 'parNyitAzon',
                    width: '14%',
                },
                {   text: 'Nyitás dátuma',
                    value: 'parNyitDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '14%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Nyitás darabszáma', 
                    value: 'parNyitDarab',
                    align: 'end',
                    width: '14%',
                },
                {   text: 'Eddig párosított', 
                    value: 'parParositott',
                    align: 'end',
                    width: '14%',
                },
                {   text: 'Zárás azonosítója', 
                    value: 'parZarAzon',
                    width: '14%',
                },
                {   text: 'Most párosítandó', 
                    value: 'parDarab',
                    align: 'end',
                    width: '14%',
                },
                {   text: 'Zárás dátuma',
                    value: 'parZarDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '14%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            alert: false,
            mostParDarab: '',
            editItem: '',
            maxNyitPar: 0,
            maxZarPar: 0,
            hozamBeallDialogOpen: false,
            itemHozambeallitashoz: {},
        }),
    }
</script>

<style>
</style>
