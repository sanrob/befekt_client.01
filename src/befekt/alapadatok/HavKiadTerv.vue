<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="hktSorszam"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Havi kiadás tervezet</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                 <v-switch 
                    v-model="checkbox"
                    label="Csak az aktívak"
                    color="blue"
                    class="mt-6"
                    @click="aktivOsszesValtas"
                ></v-switch>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialog"
                    max-width="1000px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Havi kiadás tervezet karbantartása</span>
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
                                                v-model="editedItem.hktSorszam"
                                                v-mask="'###'"
                                                :rules="rulesHktSorszam"
                                                label="Tervezet sorszáma">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="5">
                                            <v-text-field
                                                v-model="editedItem.hktMegnev"
                                                :rules="megnevRules"
                                                label="Tervezet megnevezése"
                                                :disabled="editFieldDisabled">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Számla neve"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.hktSzamla"
                                                :rules="szamlaRules"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="4">
                                            <v-currency-field 
                                                label="Tervezett összeg" 
                                                :rules="rulesHktOsszeg"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.hktOsszeg"
                                                locale='hu-HU'
                                                :decimalLength=0
                                                :defaultValue=0
                                                :valueAsInteger=true
                                                :allowNegative=false />
                                        </v-col>
                                        <v-col cols="4">
                                            <v-menu
                                                offset-x
                                                v-model="menuTol"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Érvényesség kezdete"
                                                        v-model="formatErvKezdet"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesErvKezdet"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="formatPickerErvKezdet"
                                                    locale="hu-HU"
                                                    @input="menuTol = false"
                                                ></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-menu
                                                offset-x
                                                v-model="menuIg"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Érvényesség vége"
                                                        v-model="formatErvVeg"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesErvVeg"
                                                        clearable
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="formatPickerErvVeg"
                                                    locale="hu-HU"
                                                    @input="menuIg = false"
                                                ></v-date-picker>
                                            </v-menu>
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
        <template v-slot:item.hktOsszeg="{ item }">
            <span>{{ formatNumber(item.hktOsszeg) }}</span>
        </template>
        <template v-slot:item.hktDatumTol="{ item }">
            <span>{{ formatDate(item.hktDatumTol) }}</span>
        </template>
        <template v-slot:item.hktDatumIg="{ item }">
            <span>{{ formatDate(item.hktDatumIg) }}</span>
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
                <span>Havi tervezet adatainak módosítása</span>
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
                <span>Havi tervezet törlése</span>
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
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                hktSorszam: '',
                hktMegnev: '',
                hktSzamla: '',
                hktOsszeg: '',
                hktDatumTol: '',
                hktDatumIg: '',
                hktMddat: '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                hktSorszam: '',
                hktMegnev: '',
                hktSzamla: '',
                hktOsszeg: '',
                hktDatumTol: '',
                hktDatumIg: '',
                hktMddat: '',
            },
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Sorszám', 
                    value: 'hktSorszam',
                    sortable: true,
                    width: '10%',
                },
                {   text: 'Tervezet megnevezése', 
                    value: 'hktMegnev',
                    width: '28%',
                },
                {   text: 'Számla neve', 
                    value: 'hktSzamlaNev',
                    width: '15%',
                },
                {   text: 'Tervezett összeg', 
                    value: 'hktOsszeg',
                    align: 'end',
                    width: '14%',
                },
                {   text: 'Érvényesség kezdete',
                    value: 'hktDatumTol',
                    dataType: "Date",
                    align: 'start',
                    width: '15%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Érvényesség vége',
                    value: 'hktDatumIg',
                    dataType: "Date",
                    align: 'start',
                    width: '15%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            szamlak: [],                                    // Számlák lista elemei
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            menuTol: false,                                 // A DatePicker mint menü megjelenítés vezérlője - Érv. -tól
            menuIg: false,                                  // A DatePicker mint menü megjelenítés vezérlője - Érv. -ig
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            editFieldDisabled: false,
            checkbox: false,
            szamlaRules: [                                  // Számla mező validációs eljárásai
                v => !!v || 'Számla megadása kötelező!'
            ],
            megnevRules: [                                  // Megnevezés mező validációs eljárásai
                v => !!v || 'Megnevezés kitöltése kötelező!'
            ],
            uzenetText: "",                                 // Üzenet dialog szövege
            alert: false,
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/B');
                    this.szamlak = szamlakRes.data;
                    this.osszesHavKiadTervFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            async osszesHavKiadTervFormUpdate() {           // Táblázat feltöltése az adott év bevételeivel
                try {
                    const havKiadTervek = await this.$axios.get('http://localhost:8080/havkiadtervek/');
                    this.tetelek = havKiadTervek.data;
                } catch(e) {
                    alert(e)
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
                        this.addHavKiadTerv();
                    } else {
                        this.modifyHavKiadTerv();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteHavKiadTerv();
                }
            },
            async addHavKiadTerv() {                        // Új tétel fölvétele
                try {
                    const adat = await this.$axios.post('http://localhost:8080/havkiadtervek', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesHavKiadTervFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.hktSorszam = item.hktSorszam;
                this.editedItem.hktMegnev = item.hktMegnev;
                this.editedItem.hktSzamla = item.hktSzamla;
                this.editedItem.hktOsszeg = item.hktOsszeg;
                this.editedItem.hktDatumTol = item.hktDatumTol;
                this.editedItem.hktDatumIg = item.hktDatumIg;
                this.editFieldDisabled = true;
                this.dialog = true
            },
            async modifyHavKiadTerv() {                     // Korábbi tétel módosítása
                try {
                    await this.$axios.put('http://localhost:8080/havkiadtervek', this.editedItem);
                    this.close();
                    this.osszesHavKiadTervFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                this.torlItem = item
                this.confirmOpen = true
                this.confirmMode = 'T'
            },
            async deleteHavKiadTerv() {                         // Tényleges törlés kezdeményezése
                try {
                    await this.$axios.delete('http://localhost:8080/havkiadtervek/' + this.torlItem.id);
                    this.osszesHavKiadTervFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            formatDate(date) {                              // A táblázatban és az editált felületen formázott dátum megjelenítése
                return date ? moment(date).format('YYYY.MM.DD') : "";
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 0, maximumFractionDigits: 0});
            },
            pozitivSzam(v) {                                // Formázott szám pozitív értékű-e
                let ret = false;
                let val = v.toLocaleString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * 100) / 100;
                if (val > 0) {
                    ret = true;
                }
                return ret;
            },
            aktivOsszesValtas() {
                alert('Event alatt:' + this.checkbox);
            },
        },
        computed: {
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új havi kiadás tervezet adatsor fölvitele' : 'Havi kiadás tervezet adatsor adatainak módosítása';
            },
            formatErvKezdet: {                              // Editált érvényesség kezdete dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.hktDatumTol;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.hktDatumTol = value;
                },
            },
            formatPickerErvKezdet: {                        // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.hktDatumTol;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.hktDatumTol = value;
                },
            },
            formatErvVeg: {                                 // Editált érvényesség vége dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.hktDatumIg;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.hktDatumIg = value;
                },
            },
            formatPickerErvVeg: {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.hktDatumIg;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.hktDatumIg = value;
                },
            },
            rulesErvKezdet () {                             // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Bevétel dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesErvVeg () {                                // Az érvényesség végére vonatkozó validációs szabályok
                const rules = [];
//                const rule2 = v => (!!v && v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
//                rules.push(rule2);
                return rules;
            },
            rulesHktOsszeg () {                             // A tervezet összegére vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Tervezet összegének kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Csak pozitív összeg érték megengedett!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesHktSorszam () {                            // A tervezet sorszámára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Tervezet sorszámának megadása kötelező!';
                const rule2 = v => (v && v.length >= 3) || 'Kötelező teljes hosszban (3) kitölteni!';
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
