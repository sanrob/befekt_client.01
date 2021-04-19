<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="bffKod"
        sort-desc
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Befektetés fajták karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialogOpen"
                    max-width="1100px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Befektetés fajták karbantartása</span>
                        </v-card-subtitle>
                        <v-card-text>
                            <v-form
                                v-model="formValid"
                                ref="form"
                            >
                                <v-container>
                                    <v-row>
                                        <v-col cols="3">
                                            <v-text-field
                                                v-model="editedItem.bffKod"
                                                v-mask="'###'"
                                                :rules="rulesBffKod"
                                                label="Befektetés fajta kódja"
                                                :disabled="editFieldDisabled">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field
                                                v-model="editedItem.bffMegnev"
                                                :rules="megnevRules"
                                                label="Befektetés fajta megnevezése">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="3">
                                            <v-select 
                                                label="Befektetés fajta típusa"
                                                :items="befFajtaTipusok"
                                                item-text="domMegnev"
                                                item-value="domKod"
                                                v-model="editedItem.bffTip"
                                                :rules="befFajtaTipRules"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Elszámolási számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.bffSzamla"
                                                :rules="elszSzamlaRules"
                                                @change="valueChangeElszSzamla"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Jutalék elszámolási számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.bffJutSzla"
                                                :rules="jutSzamlaRules"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Kötési egység" 
                                                :rules="rulesKotEgyseg"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bffEgyseg"
                                                locale='hu-HU'
                                                :decimalLength=0
                                                :defaultValue=0
                                                :valueAsInteger=true
                                                :allowNegative=false />
                                        </v-col>
                                        <v-col cols="2">
                                            <v-select 
                                                label="Elszámolás módja"
                                                :items="befElszamTipusok"
                                                item-text="domMegnev"
                                                item-value="domKod"
                                                v-model="editedItem.bffNyitElsz"
                                                :rules="befElszModRules"
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
            </v-toolbar>
            <confirm
                :mode="confirmMode"
                :dialog="confirmOpen"
                @IgenValasz="igenValasz"
                @NemValasz="confirmBezar">
            </confirm>
            <v-alert
                v-model="alert"
                type="warning"
                elevation=8
                dismissible
            >
                {{ uzenetText }}
            </v-alert>
        </template>
        <template v-slot:item.bffEgyseg="{ item }">
            <span>{{ formatNumber(item.bffEgyseg) }}</span>
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
                <span>Befektetés fajta adatainak módosítása</span>
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
                <span>Befektetés fajta törlése</span>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script>
    import Confirm from '../../utils/Confirm.vue';
    import {mask} from 'vue-the-mask';
    export default {
        directives: {
            mask
        },
        components: {
            confirm: Confirm
        },
        created () {
            this.initialize();
        },
        data: () => ({
            uzenetText: "",                                 // Üzenet dialog szövege
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Kód',
                    value: 'bffKod',
                    align: 'start',
                    sortable: true,
                    width: '7%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Megnevezés', 
                    value: 'bffMegnev',
                    width: '21%',
                },
                {   text: 'Típus', 
                    value: 'bffTipNev',
                    width: '9%',
                },
                {   text: 'Elszámolási számla', 
                    value: 'bffSzamlaNev',
                    width: '18%',
                },
                {   text: 'Jutalék számla', 
                    value: 'bffJutSzlaNev',
                    width: '18%',
                },
                {   text: 'Kötési egység', 
                    value: 'bffEgyseg',
                    align: 'end',
                    width: '10%',
                },
                {   text: 'Elszámolás módja', 
                    value: 'bffNyitElszNev',
                    width: '11%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            befFajtaTipusok: [],                            // A lehetséges befektetés fajta típusok
            befElszamTipusok: [],                           // A lehetséges befektetés elszámolás típusok
            szamlak: [],                                    // Számlák lista elemei
            dialogOpen: false,                              // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                bffKod: '',
                bffMegnev: '',
                bffTip: '',
                bffSzamla: '',
                bffJutSzla: '',
                bffEgyseg: '',
                bffNyitElsz: '',
                bffMddat: '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                bffKod: '',
                bffMegnev: '',
                bffTip: '',
                bffSzamla: '',
                bffJutSzla: '',
                bffEgyseg: '',
                bffNyitElsz: '',
                bffMddat: '',
            },
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            errors: {},                                     // v-currency mezővel kapcsolatos
            megnevRules: [                                  // Szöveg mező validációs eljárásai
                v => !!v || 'Megnevezés kitöltése kötelező!'
            ],
            befFajtaTipRules: [                             // Befektetés fajta típus mező validációs eljárásai
                v => !!v || 'Befektetés fajta típus kitöltése kötelező!'
            ],
            elszSzamlaRules: [                              // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Elszámolási számla kitöltése kötelező!'
            ],
            jutSzamlaRules: [                               // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Jutalék számla kitöltése kötelező!'
            ],
            befElszModRules: [                              // Elszámolás módja mező validációs eljárásai
                v => !!v || 'Elszámolás módja mező kitöltése kötelező!'
            ],
            alert: false,
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const befFajtaTips = await this.$axios.get('http://localhost:8080/alapadatok/domains/BEFFAJTTIP');
                    this.befFajtaTipusok = befFajtaTips.data;
                    const befElszamTips = await this.$axios.get('http://localhost:8080/alapadatok/domains/BEFELSZAM');
                    this.befElszamTipusok = befElszamTips.data;
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/P');
                    this.szamlak = szamlakRes.data;
                    this.osszesBefektFajtakFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            async osszesBefektFajtakFormUpdate() {          // Táblázat feltöltése az adott év bevételeivel
                try {
                    const befektFajtak = await this.$axios.get('http://localhost:8080/befektfajtak/');
                    this.tetelek = befektFajtak.data;
                } catch(e) {
                    alert(e)
                }
            },
            async addBefektFajta() {                        // Új tétel fölvétele
                try {
                    const adat = await this.$axios.post('http://localhost:8080/befektfajtak', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesBefektFajtakFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
            close () {                                      // Mégse gombra végrehajtandó
                this.$refs.form.reset();                    // Validáció alapra állítása
                this.editedItem = Object.assign({}, this.defaultItem)
                this.dialogOpen = false;
                this.editedIndex = -1;
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
                    if (this.editedIndex === -1) {
                        this.addBefektFajta();
                    } else {
                        this.modifyBefektFajta();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteBefektFajta();
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.bffKod = item.bffKod;
                this.editedItem.bffMegnev = item.bffMegnev;
                this.editedItem.bffTip = item.bffTip;
                this.editedItem.bffSzamla = item.bffSzamla;
                this.editedItem.bffJutSzla = item.bffJutSzla;
                this.editedItem.bffEgyseg = item.bffEgyseg;
                this.editedItem.bffNyitElsz = item.bffNyitElsz;
                this.editedItem.bffMddat = item.bffMddat;
                this.dialogOpen = true
            },
            async modifyBefektFajta() {                     // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektfajtak/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesBefektFajtakFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem(item) {                              // Törlés Confirm ablak megnyitása
                this.torlItem = item
                this.confirmOpen = true
                this.confirmMode = 'T'
            },
            async deleteBefektFajta() {                     // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/befektfajtak/delete/' + this.torlItem.id + '/' + this.torlItem.bffMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.dialogOpen = false;
                    } else {
                        this.dialogOpen = false;
                        this.osszesBefektFajtakFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
            formatNumber(number) {                          // Kötési egység összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 0, maximumFractionDigits: 0});
            },
            pozitivSzam(v) {                                // Formázott szám pozitív értékű-e
                let ret = false;
                let val = v.toString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * 100) / 100;
                if (val > 0) {
                    ret = true;
                }
                return ret;
            },
            valueChangeElszSzamla() {
                this.editedItem.bffJutSzla = this.editedItem.bffSzamla;
            },
        },
        computed: {
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új befektetés fajta adatsor fölvitele' : 'Befektetés fajta adatsor adatainak módosítása';
            },
            editFieldDisabled () {                          // Az adott mező editálható-e
                return this.editedIndex === -1 ? false : true;
            },
            rulesBffKod () {                                // A devizanem kódjára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Befektetés fajta kódjának megadása kötelező!';
                const rule2 = v => (v && v.length >= 3) || 'Kötelező teljes hosszban (3) kitölteni!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesKotEgyseg () {                             // A kötési egységre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'A kötési egység kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Csak pozitív összeg érték megengedett!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
        },
        watch: {
        },
    }
</script>

<style>
</style>
