<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="beaArfDatum"
        sort-desc
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
                <v-toolbar-title>Befektetés árfolyamok karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-menu 
                    offset-y
                    max-width=500
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">{{ kivBefekt.bffMegnev }}</v-btn>
                    </template>
                    <v-list
                        dense
                        max-height="200px"
                        class="overflow-y-auto"
                    >
                        <v-list-item
                            v-for="(befektFajta) in befektFajtak"
                            :key="befektFajta.bffKod"
                            @click="changeBefektFajta(befektFajta)"
                        >
                            <v-list-item-title>{{ befektFajta.bffMegnev }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-toolbar-title class="ml-3">(befektetés fajta neve)</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialog"
                    max-width="400px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Árfolyamok karbantartása</span>
                        </v-card-subtitle>
                        <v-card-text>
                            <v-form
                                v-model="formValid"
                                ref="form"
                            >
                                <v-container>
                                    <v-row>
                                        <v-col cols="6">
                                            <v-menu
                                                offset-x
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Árfolyam dátuma"
                                                        v-model="formatEditDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesArfDatum"
                                                        :disabled="editFieldDisabled"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="formatPickerInput"
                                                    locale="hu-HU"
                                                    @input="menu = false"
                                                ></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-currency-field 
                                                label="Árfolyam" 
                                                :rules="rulesArfolyamAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.beaArfolyam"
                                                :decimalLength=6
                                                :defaultValue=0
                                                locale='hu-HU'/>
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
        <template v-slot:item.beaArfDatum="{ item }">
            <span>{{ formatDate(item.beaArfDatum) }}</span>
        </template>
        <template v-slot:item.beaArfolyam="{ item }">
            <span>{{ formatNumberArf(item.beaArfolyam) }}</span>
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
                <span>Befektetés árfolyam adatainak módosítása</span>
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
                <span>Befektetés árfolyam törlése</span>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script>
    import Confirm from '../../utils/Confirm.vue';
    import moment from 'moment';
    export default {
        components: {
            confirm: Confirm
        },
        created () {
            this.initialize();
        },
        data: () => ({
            pagination: {
            },
            uzenetText: "",                                 // Üzenet dialog szövege
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                beaBefAzon: '',
                beaArfDatum: '',
                beaArfolyam: '',
                beaMddat : '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                beaBefAzon: '',
                beaArfDatum: '',
                beaArfolyam: '',
                beaMddat : '',
            },
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Árfolyam dátuma',
                    value: 'beaArfDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '13%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Árfolyam', 
                    value: 'beaArfolyam',
                    align: 'end',
                    width: '13%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            menu: false,                                    // A DatePicker mint menü megjelenítés vezérlője
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            editFieldDisabled: false,
            alert: false,
            befektFajtak: [],                               // Befektetés fajták lista elemei
            kivBefekt: '',                                  // A kiválasztott befektetés fajta
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const befFajtakRes = await this.$axios.get('http://localhost:8080/befektfajtak/kivalasztashoz');
                    this.befektFajtak = befFajtakRes.data;
                    this.kivBefekt = this.befektFajtak[0];
                    this.osszesArfolyamFormUpdate(this.kivBefekt);
                } catch(e) {
                    alert(e)
                }
            },
            async osszesArfolyamFormUpdate(befektFajta) {             // Táblázat feltöltése az adott év bevételeivel
                try {
                    const arfolyamok = await this.$axios.get('http://localhost:8080/befektetesarfolyam/' + befektFajta.bffKod);
                    this.tetelek = arfolyamok.data;
                } catch(e) {
                    alert(e)
                }
            },
            changeBefektFajta(newBefektFajta) {             // Befektetés fajta változásakor hajtódik végre
                if (this.kivBefekt != newBefektFajta) {
                    this.kivBefekt = newBefektFajta;
                    this.osszesArfolyamFormUpdate(this.kivBefekt);
                }
            },
            close () {                                      // Mégse gombra végrehajtandó
                this.$refs.form.reset();                    // Validáció alapra állítása
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editFieldDisabled = false;
                this.dialog = false;
                this.editedIndex = -1;
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
                if (this.confirmMode === 'F') {
                    if (this.editedIndex === -1) {
                        this.addBefektetesArfolyam();
                    } else {
                        this.modifyBefektetesArfolyam();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteBefektetesArfolyam();
                }
            },
            async addBefektetesArfolyam() {                 // Új tétel fölvétele
                try {
                    this.editedItem.beaBefAzon = this.kivBefekt.bffKod;
                    await this.$axios.post('http://localhost:8080/befektetesarfolyam', this.editedItem);
                    this.close();
                    this.osszesArfolyamFormUpdate(this.kivBefekt);
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.beaBefAzon = item.beaBefAzon;
                this.editedItem.beaArfDatum = item.beaArfDatum;
                this.editedItem.beaArfolyam = item.beaArfolyam;
                this.editedItem.beaMddat = item.beaMddat;
                this.editFieldDisabled = true;
                this.dialog = true
            },
            async modifyBefektetesArfolyam() {              // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektetesarfolyam/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesArfolyamFormUpdate(this.kivBefekt);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                this.torlItem = item
                this.confirmOpen = true
                this.confirmMode = 'T'
            },
            async deleteBefektetesArfolyam() {              // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/befektetesarfolyam/delete/' + this.torlItem.id + '/' + this.torlItem.beaMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesArfolyamFormUpdate(this.kivBefekt);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return moment(date).format('YYYY.MM.DD');
            },
            formatNumberArf(number) {                       // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 6, maximumFractionDigits: 6});
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
        },
        computed: {
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Adott napi árfolyam fölvitele' : 'Adott napi árfolyam módosítása';
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.beaArfDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.beaArfDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.beaArfDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.beaArfDatum = value;
                },
            },
            rulesArfDatum () {                              // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Árfolyam dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesArfolyamAdat () {                          // Árfolyam mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivE(v, 6)) || 'Csak pozitív összeg érték megengedett!';
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
