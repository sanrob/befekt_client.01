<template>
    <div>
        <v-dialog
            persistent
            v-model="dialogHatElszOpen"
            max-width="1300px"
        >
            <v-data-table
                :headers="headers"
                :items="eddigiElszamolasok"
                :sort-by="['hatElszDatum', 'hatAzon']"
                :sort-desc="[true, true]"
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
                        <!--span>{{ zaroAzonosito | VMask('N-NNNN/NNNNN') }}</span-->
                        <!--span>({{ befektetesKod }} - {{ befektetesMegnev }}:   </span -->
                        <!--span>{{ formatZarasDarabszam }} db, {{ formatParosDarabszam }} páros)</span-->
                        <v-spacer></v-spacer>
                        <v-btn color="primary" class="mb-2" @click="ujTetel">Új tétel</v-btn>
                        <v-divider
                            class="mx-4"
                            inset
                            vertical
                        ></v-divider>
                        <v-btn color="primary" class="mb-2" @click="elszDialogBezar">Bezárás</v-btn>
                    </v-toolbar>
                </template>
                <template v-slot:item.hatAzon="{ item }">
                    <span>{{ item.hatAzon | VMask('N-NNNN/NNNNN') }}</span>
                </template>
                <template v-slot:item.hatElszDatum="{ item }">
                    <span>{{ formatDate(item.hatElszDatum) }}</span>
                </template>
                <template v-slot:item.hatElozoArf="{ item }">
                    <span>{{ formatNumber(item.hatElozoArf) }}</span>
                </template>
                <template v-slot:item.hatElszArf="{ item }">
                    <span>{{ formatNumber(item.hatElszArf) }}</span>
                </template>
                <template v-slot:item.hatDarab="{ item }">
                    <span>{{ formatNumber(item.hatDarab) }}</span>
                </template>
                <template v-slot:item.hatElszOsszeg="{ item }">
                    <span>{{ formatNumber(item.hatElszOsszeg) }}</span>
                </template>
                <template v-slot:item.hatKonyvelve="{ item }">
                    <v-simple-checkbox v-model="item.hatKonyvelve" disabled></v-simple-checkbox>
                </template>
                <template v-slot:item.action="{ item }">
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on, attrs }">
                            <v-icon
                                small
                            class="mr-1"
                            @click="editItem(item)"
                            v-bind="attrs"
                            v-on="on"
                        >
                            mdi-pencil
                        </v-icon>
                    </template>
                    <span>Határidős elsazámolás adatainak módosítása</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            small
                            class="mr-1"
                            @click="deleteItem(item)"
                            v-bind="attrs"
                            v-on="on"
                        >
                            mdi-delete
                        </v-icon>
                    </template>
                    <span>Határidős elsazámolás törlése</span>
                </v-tooltip>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                        <v-icon
                            small
                            class="mr-1"
                            @click="szamlaKonyveles(item)"
                            v-bind="attrs"
                            v-on="on"
                        >
                            mdi-book-open
                        </v-icon>
                    </template>
                    <span>Határidős elsazámolás könyvelése</span>
                </v-tooltip>
                </template>
            </v-data-table>
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
        <v-dialog
            persistent
            v-model="elszKarbDialogOpen"
            max-width="1150px"
        >
            <v-card>
                <v-card-title>
                    <span class="headline">Határidős elszámolás karbantartása és könyvelése</span>
                </v-card-title>
                <v-card-subtitle>
                    <span class="caption">Új elszámolás mindig az előző elszámolás naphoz képest tröténik</span>
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
                                        v-model="hatElszRec.hatAzon"
                                        readonly
                                        label="Határidős elszámolás azon."
                                    >
                                    </v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-menu
                                        offset-x
                                        v-model="pickerMenuBez"
                                        :close-on-content-click="false"
                                        :nudge-right="10"
                                    >
                                        <template v-slot:activator="{ on, attrs }">
                                            <v-text-field
                                                label="Elszámolás dátuma"
                                                v-model="formatEditDate"
                                                readonly
                                                v-bind="attrs"
                                                v-on="on"
                                                :rules="rulesElszDatum"
                                            ></v-text-field>
                                        </template>
                                        <v-date-picker
                                            width="250"
                                            v-model="formatPickerInput"
                                            locale="hu-HU"
                                            @input="pickerMenuBez = false"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="hatElszRec.hatDarab"
                                        readonly
                                        label="Darabszám"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        v-model="hatElszRec.hatElozoArf"
                                        readonly
                                        label="Előző árfolyam"/>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Elszámoló árfolyam"
                                        :rules="rulesElszArfolyam"
                                        :error-messages="errors.rate"
                                        v-model="hatElszRec.hatElszArf"
                                        @change="valueChangedElszArf"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-currency-field 
                                        label="Adó mérték" 
                                        v-model="hatElszRec.hatElszOsszeg"
                                        :rules="rulesElszOsszeg"/>
                                </v-col>
                                <v-col cols="3">
                                    <v-select 
                                        label="Határidős számla"
                                        :items="tartKovSzamlak"
                                        item-text="szaMegnev"
                                        item-value="szaKod"
                                        v-model="hatElszRec.hatHatSzamla"
                                        :rules="rulesHatSzamla"
                                        :disabled="editFieldDisabled"
                                    >
                                    </v-select>
                                </v-col>
                                <v-col cols="3">
                                    <v-select 
                                        label="Elszámoló számla"
                                        :items="tartKovSzamlak"
                                        item-text="szaMegnev"
                                        item-value="szaKod"
                                        v-model="hatElszRec.hatElszSzamla"
                                        :rules="rulesElszSzamla"
                                        :disabled="editFieldDisabled"
                                    >
                                    </v-select>
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
                        @click="save">
                        Mentés
                    </v-btn>
                    <v-btn 
                        color="blue darken-1" 
                        text 
                        @click="bezaras">
                        Mégse
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
            dialogHatElszOpen:  {type: Boolean},
            eddigiElszamolasok: {type: Array},
            tartKovSzamlak:     {type: Array},
            befektTetel:        {type: Object},
//            zaroAzonosito:      {type: String},
//            befektetesKod:      {type: String},
//            befektetesMegnev:   {type: String},
//            zarasDarabszam:     {type: Number},
//            parosDarabszam:     {type: Number},
        },
        components: {
            confirm: Confirm,
            hozamBeallitas: HozamBeallitas,
        },
        methods: {
            elszDialogBezar() {
                this.$emit('HatElszPanelBezarasUpdateFalse');
            },
            hozamBeallitoDialogBezar() {
                this.hozamBeallDialogOpen = false;
            },
            bezaras() {
                this.elszKarbDialogOpen = false;
            },
            editItem(item) {
                this.hatElszRec = item;
                this.elszKarbDialogOpen = true;

            },
            deleteItem() {

            },
            ujTetel() {
//                this.editItem = item;
//                this.maxNyitPar = item.parNyitDarab - item.parParositott + item.parDarab;
//                this.maxZarPar = this.zarasDarabszam - this.parosDarabszam + item.parDarab;
//                this.mostParDarab = item.parDarab != 0 ? item.parDarab : Math.min(this.maxNyitPar, this.maxZarPar);
                this.hatElszRec.hatDarab = this.befektTetel.befDarab - this.befektTetel.befParDarab;
                if (this.eddigiElszamolasok.length == 0) {
                    this.hatElszRec.hatElozoArf = this.befektTetel.befArfolyam;
                } else {
                    const utolsoElsz = this.eddigiElszamolasok[this.eddigiElszamolasok.length - 1];
                    this.hatElszRec.hatElozoArf = utolsoElsz.hatElszArf;
                }
                this.elszKarbDialogOpen = true;
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
                this.hatElszRec.hatNyitoId = this.befektTetel.id;

                if (this.confirmMode === 'F') {
                    this.tetelMentese();
//                    if (this.editedIndex === -1) {
//                        this.addBefektZaras();
//                    } else {
//                        this.modifyBefektZaras();
//                    }
//                } else if (this.confirmMode === 'T') {
//                    this.deleteBefektZaras();
                } else if (this.confirmMode === 'K') {
                    this.szamlakonyvHatElsz();
                } else if (this.confirmMode === 'L') {
                    this.szamlakonyvTorleseHatElsz();
                }
            },
            async tetelMentese() {                          // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektetesek/savehatelsz', this.hatElszRec);
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
            szamlaKonyveles(item) {                         // Tétel számlakönyvelése
                alert(item.hatMddat);
                this.szlaKonyvItem = item;
                if (item.hatKonyvelve) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlakonyvHatElsz() {                    // Számlakönyvelés végrehajtása
                try {
                        alert(this.szlaKonyvItem.hatElszDatum);
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektetesek/hatelszszlakonyveles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.hatMddat);
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
            async szamlakonyvTorleseHatElsz() {             // Számlakönyvelés törlésének végrehajtása
                try {
//                    alert('szamlakonyvTorleseHatElsz: ' + this.szlaKonyvItem.hatAzon);
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektetesek/hatelszszlakonytorles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.hatMddat);
//                    alert('status: ' + adat.status + ', data:' +adat.data);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        alert('alert=' + this.alert);
                        this.alert = true;
                        this.close();
                    } else {
//                        this.osszesBefektZarasFormUpdate(this.zarasEve);
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
            valueChangedElszArf() {
                this.hatElszRec.hatElszOsszeg = Math.round(
                    (this.hatElszRec.hatElszArf - this.hatElszRec.hatElozoArf) * this.hatElszRec.hatDarab * 100) / 100;
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
            rulesHatSzamla () {                             // A tartozik számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Határidős számla kitöltése kötelező!';
                const rule2 = v => (v && !this.hatElszRec.hatElszSzamla)
                    || (v && !!this.hatElszRec.hatElszSzamla && v != this.hatElszRec.hatElszSzamla)
                    || 'A határidős és elszámoló számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesElszSzamla () {                            // A követel számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Elszámoló számla kitöltése kötelező!';
                const rule2 = v => (v && !this.hatElszRec.hatHatSzamla)
                    || (v && !!this.hatElszRec.hatHatSzamla && v != this.hatElszRec.hatHatSzamla)
                    || 'Az elszámoló és határidős számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesElszArfolyam () {                          // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (!v || (v && this.pozitivSzam(v))) || 'Csak pozitív érték megengedett!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesElszOsszeg () {                            // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                rules.push(rule1);
                return rules;
            },
            rulesElszDatum () {                             // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Elszámolás dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.hatElszRec.hatElszDatum;
                    if (ret) {
                        ret = this.formatDate(ret);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.hatElszRec.hatElszDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.hatElszRec.hatElszDatum;
                    if (ret) {
                        ret = ret.substr(0, 10);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.hatElszRec.hatElszDatum = value;
                },
            },
        },
        data: () => ({
            hatElszRec:      {                              // Editálandó mezők adatai
                id: '',
                hatAzon: '',
                hatNyitoId: '',
                hatNyitoAzon: '',
                hatTipus: '',
                hatTipusNev: '',
                hatElszDatum: '',
                hatElozoArf: 0,
                hatElszArf: 0,
                hatDarab: 0,
                hatElszOsszeg: 0,
                hatHatSzamla: '',
                hatHatSzamlaNev: '',
                hatElszSzamla: '',
                hatElszSzamlaNev: '',
                hatKonyvelve: false,
                hatMddat: '',
            },
            szamlak: [],                                    // Tartozik és követel számlák lista elemei
            hozamBeallito: {},
            pagination: {
            },
            uzenetText: "",                                 // Üzenet dialog szövege
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Elsz. azon.', 
                    value: 'hatAzon',
                    width: '10%',
                },
                {   text: 'Elsz. dátuma',
                    value: 'hatElszDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '10%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Előző árf.', 
                    value: 'hatElozoArf',
                    align: 'end',
                    width: '10%',
                },
                {   text: 'Elszámoló árf.', 
                    value: 'hatElszArf',
                    align: 'end',
                    width: '11%',
                },
                {   text: 'Darab', 
                    value: 'hatDarab',
                    align: 'end',
                    width: '9%',
                },
                {   text: 'Összeg', 
                    value: 'hatElszOsszeg',
                    align: 'end',
                    width: '10%',
                },
                {   text: 'Határidős számla', 
                    value: 'hatHatSzamlaNev',
                    width: '13%',
                },
                {   text: 'Elszámoló számla', 
                    value: 'hatElszSzamlaNev',
                    width: '17%',
                },
                {   text: 'Könyv.', 
                    value: 'hatKonyvelve',
                    width: '7%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                    width: '5%',
                },
            ],
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            alert: false,
            mostParDarab: '',
            editableItem: {},
            maxNyitPar: 0,
            maxZarPar: 0,
            hozamBeallDialogOpen: false,
            itemHozambeallitashoz: {},
            elszKarbDialogOpen: false,
            pickerMenuBez: false,                           // A DatePicker mint menü megjelenítés vezérlője zárás dátumára
            editFieldDisabled: false,
            szlaKonyvItem: {},
        }),
    }
</script>

<style>
</style>
