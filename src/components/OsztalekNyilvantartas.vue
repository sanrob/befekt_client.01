<template>
    <div>
        <v-dialog
            persistent
            v-model="osztalekDialogOpen"
            max-width="1150px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">Osztalék nyilvántartása és könyvelése</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="caption">Osztalék generálása, törlése és könyvelése</span>
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
                                        v-model="osztalekBeallitoRec.oszAzon"
                                        v-mask="'X-XXXX/XXXXX'"
                                        readonly
                                        label="Osztalék azonosító">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-menu
                                        offset-x
                                        v-model="menuBez"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                label="Osztalék dátuma"
                                                v-model="formatEditDate"
                                                readonly
                                                v-bind="attrs"
                                                v-on="on"
                                                :rules="rulesOsztDatum"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                            width="250"
                                            v-model="formatPickerInput"
                                            locale="hu-HU"
                                            @input="menuBez = false"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="osztalekBeallitoRec.oszBefDarab"
                                        readonly
                                        label="Még meglévő darabszám"/>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Osztalék mértéke" 
                                        :rules="rulesMertekAndOsszeg"
                                        :error-messages="errors.rate"
                                        v-model="osztalekBeallitoRec.oszMertek"
                                        @change="valueChangedOsztalekMertek"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Osztalék összege" 
                                        :rules="rulesMertekAndOsszeg"
                                        :error-messages="errors.rate"
                                        v-model="osztalekBeallitoRec.oszOsszeg"
                                        @change="valueChangedOsztalekOsszeg"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Adó %" 
                                        :rules="rulesAdoSzaz"
                                        :error-messages="errors.rate"
                                        v-model="osztalekBeallitoRec.oszAdoSzaz"
                                        @change="valueChangedAdoSzaz"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Adó mérték" 
                                        :rules="rulesAdoSzaz"
                                        :error-messages="errors.rate"
                                        v-model="osztalekBeallitoRec.oszAdo"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-select 
                                        label="Adó számla"
                                        :items="adoSzamlak"
                                        item-text="szaMegnev"
                                        item-value="szaKod"
                                        v-model="osztalekBeallitoRec.oszAdoSzamla"
                                        :rules="rulesAdoSzamla"
                                        :disabled="editFieldDisabled"
                                    >
                                    </v-select>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="3">
                                    <v-checkbox 
                                        v-model="osztalekBeallitoRec.oszKonyvelve"
                                        class="mx-2"
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
                        @click="konyveles">
                        Könyvelés
                    </v-btn>
                    <v-btn 
                        color="blue darken-1" 
                        text 
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
            osztalekDialogOpen:     {type: Boolean},
            adoSzamlak:             {type: Array},
            osztalekBeallitoRec:    {
                id: '',
                oszBefektetesId: '',
                oszAzon: '',
                oszDatum: '',
                oszBefDarab: 0,
                oszMertek: 0,
                oszOsszeg: 0,
                oszAdoSzaz: 0,
                oszAdo: 0,
                oszAdoSzamla: '',
                oszAdoSzamlaNev: '',
                oszKonyvelve: false,
                oszMddat: '',
            },
//            befektetesKod:      {type: String},
//            befektetesMegnev:   {type: String},
//            zarasDarabszam:     {type: Number},
//            parosDarabszam:     {type: Number},
        },
        components: {
            confirm: Confirm
        },
        methods: {
            dialogBezar() {
                this.$emit('OsztalekDialogBezar');
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
                this.osztalekAdatokTarolasa();
            },
            async osztalekAdatokTarolasa() {                // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektetesek/saveosztalek', this.osztalekBeallitoRec);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
//                        this.close();
                    } else {
//                        this.close();
                        this.$emit('HozamBeallitoUjraOlvas');
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async konyveles() {
                try {
                    let adat = {};
                    if (this.osztalekBeallitoRec.oszKonyvelve) {
                        adat = await this.$axios.put(
                            'http://localhost:8080/befektetesek/osztalekszlakonytorles/'
                            + this.osztalekBeallitoRec.id + '/' + this.osztalekBeallitoRec.oszMddat);
                    } else {
                        adat = await this.$axios.put(
                            'http://localhost:8080/befektetesek/osztalekszlakonyveles/'
                            + this.osztalekBeallitoRec.id + '/' + this.osztalekBeallitoRec.oszMddat);
                    }
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
//                        this.osszesBefektZarasFormUpdate(this.zarasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            close() {
                this.dialog = false;
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return date ? moment(date).format('YYYY.MM.DD') : null;
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                let ret;
                if (number) {
                    ret = number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
                } else {
                    ret = null;
                }
                alert(ret);
                return ret;
//                return number ? number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2}) : null;
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
            valueChangedOsztalekMertek() {
                if (this.osztalekBeallitoRec.oszMertek) {
                    this.osztalekBeallitoRec.oszOsszeg = Math.round(
                        this.osztalekBeallitoRec.oszBefDarab * this.osztalekBeallitoRec.oszMertek * 100) / 100;
                    this.valueChangedOsztalekOsszeg();
                }
            },
            valueChangedOsztalekOsszeg() {
                this.valueChangedAdoSzaz();
            },
            valueChangedAdoSzaz() {
                if (this.osztalekBeallitoRec.oszOsszeg && this.osztalekBeallitoRec.oszAdoSzaz) {
                    this.osztalekBeallitoRec.oszAdo = Math.round(
                        this.osztalekBeallitoRec.oszOsszeg * this.osztalekBeallitoRec.oszAdoSzaz) / 100;
                }
            },
        },
        computed: {
            formatZarasDarabszam() {                        // Táblázatban összegmező formázott megjelenítése
                return this.zarasDarabszam.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            formatParosDarabszam() {                        // Táblázatban összegmező formázott megjelenítése
                return this.parosDarabszam.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            rulesOsztDatum () {                              // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Osztalék dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.osztalekBeallitoRec.oszDatum;
                    if (ret) {
                        ret = this.formatDate(ret);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.osztalekBeallitoRec.oszDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.osztalekBeallitoRec.oszDatum;
                    if (ret) {
                        ret = ret.substr(0, 10);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.osztalekBeallitoRec.oszDatum = value;
                },
            },
            rulesAdoSzamla () {                             // A hova számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Adó számla kitöltése kötelező!';
                rules.push(rule1);
                return rules;
            },
            rulesAdoSzaz () {                               // Adó % mezőkre vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => (!v || (v && !this.negativSzam(v))) || 'Negatív érték nem megengedett!';
                rules.push(rule2);
                return rules;
            },
            rulesMertekAndOsszeg () {                       // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (!v || (v && this.pozitivSzam(v))) || 'Csak pozitív érték megengedett!';
                rules.push(rule2);
                rules.push(rule1);
                return rules;
            },
        },
        data: () => ({
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
//            szamlak: [],                                  // Honnan és hova számlák lista elemei
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
            menuBez: false,                                 // A DatePicker mint menü megjelenítés vezérlője zárás dátumára
        }),
    }
</script>

<style>
</style>
