<template>
    <div>
        <v-dialog
            persistent
            v-model="hozamBeallDialogOpen"
            max-width="1150px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">Hozam értékek beállítása és könyvelése</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="caption">Számított hozam módosítható, pozitív és negatív érték könyvelése eltér</span>
                </v-card-subtitle>
                <v-card-text>
                    <v-form
                        v-model="formValid"
                        ref="form"
                    >
                        <v-container>
                            <v-row>
                                <v-col cols="2">
                                    <v-text-field
                                        v-model="hozamBeallitoRec.hobAzon"
                                        readonly
                                        label="Hozam azonosító"
                                    >
                                    </v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field
                                        :value="formatDate(hozamBeallitoRec.hobZarDatum)"
                                        readonly
                                        label="Zárás dátuma">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="hozamBeallitoRec.hobBruttoHozam"
                                        readonly
                                        label="Bruttó hozam"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="hozamBeallitoRec.hobNyitoJutalek"
                                        readonly
                                        label="Nyitási jutalék"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="hozamBeallitoRec.hobZaroJutalek"
                                        readonly
                                        label="Zárási jutalék"/>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Nettó hozam" 
                                        :rules="rulesOsszegAdat"
                                        :error-messages="errors.rate"
                                        v-model="hozamBeallitoRec.hobNettoHozam"
                                        @change="valueChangeNettoHozam"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Adó %" 
                                        :rules="rulesAdoSzaz"
                                        :error-messages="errors.rate"
                                        v-model="hozamBeallitoRec.hobAdoSzaz"
                                        @change="valueChangeAdoSzaz"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Adó mérték" 
                                        v-model="hozamBeallitoRec.hobAdo"/>
                                </v-col>
                                <v-col cols="3">
                                    <v-select 
                                        label="Tartozik számla"
                                        :items="tartKovSzamlak"
                                        item-text="szaMegnev"
                                        item-value="szaKod"
                                        v-model="hozamBeallitoRec.hobTartSzamla"
                                        :rules="rulesTartSzamla"
                                        :disabled="editFieldDisabled"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="3">
                                    <v-select 
                                        label="Követel számla"
                                        :items="tartKovSzamlak"
                                        item-text="szaMegnev"
                                        item-value="szaKod"
                                        v-model="hozamBeallitoRec.hobKovSzamla"
                                        :rules="rulesKovSzamla"
                                        :disabled="editFieldDisabled"
                                    >
                                    </v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="3">
                                    <v-checkbox 
                                        v-model="hozamBeallitoRec.hobKonyvelve"
                                        readonly
                                        class="mx-1"
                                        label="Könyvelve-e"
                                    >
                                    </v-checkbox>
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
                        :disabled="konyvelesDisabled"
                        @click="konyveles">
                        Könyvelés
                    </v-btn>
                    <v-btn 
                        color="blue darken-1" 
                        text 
                        :disabled="mentesDisabled"
                        @click="save">
                        Mentés
                    </v-btn>
                    <v-btn 
                        color="blue darken-1" 
                        text 
                        @click="dialogBezar">
                        Mégse
                    </v-btn>
                </v-card-actions>
            </v-card>
            <v-alert
                v-model="alert"
                type="warning"
                elevation=10
                dismissible
            >
                {{ uzenetText }}
            </v-alert>
        </v-dialog>
        <confirm
            :mode="confirmMode" 
            :dialog="confirmOpen"
            @IgenValasz="igenValasz"
            @NemValasz="confirmBezar">
        </confirm>
    </div>
</template>

<script>
    import moment from 'moment';
    import Confirm from '../utils/Confirm.vue';
    export default {
        props: {
            hozamBeallDialogOpen:  {type: Boolean},
            tartKovSzamlak:        {type: Array},
            hozamBeallitoRec:      {                        // Editálandó mezők adatai
                id: '',
                hobParositasId: '',
                hobAzon: '',
                hobZarDatum: '',
                hobBruttoHozam: 0,
                hobNyitoJutalek: 0,
                hobZaroJutalek: 0,
                hobNettoHozam: 0,
                hobAdoSzaz: 0,
                hobAdo: 0,
                hobTartSzamla: '',
                hobTartSzamlaNev: '',
                hobKovSzamla: '',
                hobKovSzamlaNev: '',
                hobKonyvelve: false,
                hobMddat: '',
            },
        },
        components: {
            confirm: Confirm
        },
        methods: {
            dialogBezar() {
                this.$emit('HozamBeallitoDialogBezar');
            },
            save () {                                       // OK gombra végrehajtandó
                if (this.$refs.form.validate()) {           // Csak ha Form tartalma valid
                    this.confirmMode = 'F';
                    this.confirmOpen = true;                // Megnyílik a confirm-áló panel.
                }
            },
            confirmBezar: function() {                      // Confirm-áló ablak bezárása.
                this.confirmOpen = false;
            },
            igenValasz() {                                  // Confirm panelen: Új tétel fölvétele/Régi módosítása
                this.confirmBezar();
                if (this.confirmMode === 'F') {
                    this.hozamAdatokTarolasa();
                } else {
                    this.szamlaKonyveles();
                }
            },
            async hozamAdatokTarolasa() {                   // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektzarasok/savehozam', this.hozamBeallitoRec);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.$emit('HozamBeallitoUjraOlvas');
                    }
                } catch(e) {
                    alert(e)
                }
            },
            konyveles() {                                   // Tétel számlakönyvelése
                if (this.hozamBeallitoRec.hobKonyvelve) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlaKonyveles() {
                try {
                    let adat = {};
                    if (this.confirmMode === 'L') {
                        adat = await this.$axios.put(
                            'http://localhost:8080/befektzarasok/hozamszlakonytorles/'
                            + this.hozamBeallitoRec.id + '/' + this.hozamBeallitoRec.hobMddat);
                    } else {
                        adat = await this.$axios.put(
                            'http://localhost:8080/befektzarasok/hozamszlakonyveles/'
                            + this.hozamBeallitoRec.id + '/' + this.hozamBeallitoRec.hobMddat);
                    }
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.$emit('HozamBeallitoUjraOlvas');
                    }
                } catch(e) {
                    alert(e)
                }
            },
            pozitivSzam(v) {
                return this.pozitivE(v, 2);
            },
            pozitivE(v, n) {                                // Formázott szám pozitív értékű-e, adott pontosságon
                let ret = false;
                let val = v.toString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n);
                if (val > 0) {
                    ret = true;
                }
                return ret;
            },
            negativSzam(v) {                                // Formázott szám negatív értékű-e
                let ret = false;
                let val = v.toString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * Math.pow(10, 2)) / Math.pow(10, 2);
                if (val < 0) {
                    ret = true;
                }
                return ret;
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return date ? moment(date).format('YYYY.MM.DD') : null;
            },
            valueChangeNettoHozam() {
                if (this.hozamBeallitoRec.hobAdoSzaz) {
                    this.hozamBeallitoRec.hobAdo = (this.hozamBeallitoRec.hobNettoHozam * this.hozamBeallitoRec.hobAdoSzaz) / 100;
                }
            },
            valueChangeAdoSzaz() {
                if (this.hozamBeallitoRec.hobNettoHozam) {
                    this.hozamBeallitoRec.hobAdo = (this.hozamBeallitoRec.hobNettoHozam * this.hozamBeallitoRec.hobAdoSzaz) / 100;
                }
            },
        },
        computed: {
            konyvelesDisabled() {
                return this.hozamBeallitoRec.id ? false : true;
            },
            mentesDisabled() {
                return this.hozamBeallitoRec.hobKonyvelve ? true : false;
            },
            rulesOsszegAdat () {                            // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v && (this.pozitivSzam(v) || this.negativSzam(v)) || 'Kitöltése kötelező!';
                rules.push(rule1);
                return rules;
            },
            rulesAdoSzaz () {                               // Adó % mezőkre vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => !v || !this.negativSzam(v) || 'Negatív összeg érték megengedett!';
                rules.push(rule2);
                return rules;
            },
            rulesTartSzamla () {                            // A tartozik számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Tartozik számla kitöltése kötelező!';
                const rule2 = v => (v && !this.hozamBeallitoRec.hobKovSzamla)
                    || (v && !!this.hozamBeallitoRec.hobKovSzamla && v != this.hozamBeallitoRec.hobKovSzamla)
                    || 'A tartozik és követel számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesKovSzamla () {                             // A követel számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Követel számla kitöltése kötelező!';
                const rule2 = v => (v && !this.hozamBeallitoRec.hobTartSzamla)
                    || (v && !!this.hozamBeallitoRec.hobTartSzamla && v != this.hozamBeallitoRec.hobTartSzamla)
                    || 'A tartozik és követel számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
        },
        data: () => ({
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            editFieldDisabled: false,
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
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            alert: false,
            mostParDarab: '',
            editItem: '',
            maxNyitPar: 0,
            maxZarPar: 0,
//            konyvelesDisabled: false,
//            mentesDisabled: false,
        }),
    }
</script>

<style>
</style>
