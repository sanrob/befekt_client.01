<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        :sort-by="['kiaDatum', 'kiaAzon']"
        :sort-desc="[true, true]"
        multi-sort
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
                <v-toolbar-title>Kiadások karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-menu 
                    offset-y
                    max-width=80
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">{{ kiadasEve }}</v-btn>
                    </template>
                    <v-list
                        dense
                        max-height="200px"
                        class="overflow-y-auto"
                    >
                        <v-list-item
                            v-for="(ev) in evek"
                            :key="ev.konEv"
                            @click="changeKiadasEve(ev.konEv)"
                        >
                            <v-list-item-title>{{ ev.konEv }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-toolbar-title class="ml-3">(kiadás éve)</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialog"
                    max-width="700px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Kiadások karbantartása</span>
                        </v-card-subtitle>
                        <v-card-text>
                            <v-form
                                v-model="formValid"
                                ref="form"
                            >
                                <v-container>
                                    <v-row>
                                        <v-col cols="3">
                                            <v-menu
                                                offset-x
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Kiadás dátuma"
                                                        v-model="formatEditDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesKiaDatum"
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
                                            <v-text-field
                                                v-model="editedItem.kiaSzoveg"
                                                :rules="szovegRules"
                                                label="Szöveges leírás">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="3">
                                            <v-currency-field 
                                                label="Kiadás összege" 
                                                :rules="rulesKiaOsszeg"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.kiaOsszeg"
                                                :disabled="editFieldDisabled"/>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="5">
                                            <v-select 
                                                label="Kiadás számlája"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.kiaSzamla"
                                                :rules="szamlaRules"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="5">
                                            <v-select 
                                                label="Kiadás típusa"
                                                :items="tipusok"
                                                item-text="domMegnev"
                                                item-value="domKod"
                                                v-model="editedItem.kiaTipus"
                                                :rules="tipusRules"
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
        <template v-slot:item.kiaDatum="{ item }">
            <span>{{ formatDate(item.kiaDatum) }}</span>
        </template>
        <template v-slot:item.kiaAzon="{ item }">
            <span>{{ item.kiaAzon | VMask('N-NNNN/NNNNN') }}</span>
        </template>
        <template v-slot:item.kiaOsszeg="{ item }">
            <span>{{ formatNumber(item.kiaOsszeg) }}</span>
        </template>
        <template v-slot:item.kiaSzlaKonyv="{ item }">
            <v-simple-checkbox v-model="item.kiaSzlaKonyv" disabled></v-simple-checkbox>
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
                <span>Kiadás adatainak módosítása</span>
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
                <span>Kiadás törlése</span>
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
                <span>Kiadás számlakönyvelése, ill. annak törlése</span>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script>
    import Confirm from '../../utils/Confirm.vue';
    import Util from '../../utils/Util.js';
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
                kiaDatum: '',
                kiaSzoveg: '',
                kiaOsszeg: '',
                kiaSzamla: '',
                kiaTipus: '',
                kiaMddat : '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                kiaDatum: '',
                kiaSzoveg: '',
                kiaOsszeg: '',
                kiaSzamla: '',
                kiaTipus: '',
                kiaMddat : '',
            },
            headers: [                          // Táblázat oszlopainak leírása
                {   text: 'Kiadás dátuma',
                    value: 'kiaDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '9%',               // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Kiadás azonosító', 
                    value: 'kiaAzon',
                    width: '10%',
                },
                {   text: 'Szöveges leírás', 
                    value: 'kiaSzoveg',
                    width: '19%',
                },
                {   text: 'Kiadás összege', 
                    value: 'kiaOsszeg',
                    align: 'end',
                    width: '10%',
                },
                {   text: 'Számla', 
                    value: 'kiaSzamlaNev',
                    width: '14%',
                },
                {   text: 'Típus', 
                    value: 'kiaTipusNev',
                    width: '14%',
                },
                {   text: 'Szla.Könyv.', 
                    value: 'kiaSzlaKonyv',
                    width: '8%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            evek: [],                                       // A lehetséges könyvelési évek listája
            kiadasEve: -1,                                  // A kiválasztott bevétel éve
            tipusok: [],                                    // Kiadás típusok lista elemei
            szamlak: [],                                    // Számlák lista elemei
            tetelek: [],                                    // A táblázat tétel adatai
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            menu: false,                                    // A DatePicker mint menü megjelenítés vezérlője
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            szovegRules: [                                  // Szöveg mező validációs eljárásai
                v => !!v || 'Szöveg kitöltése kötelező!'
            ],
            szamlaRules: [                                  // Számla mező validációs eljárásai
                v => !!v || 'Számla megadása kötelező!'
            ],
            tipusRules: [                                   // Számla mező validációs eljárásai
                v => !!v || 'Kiadás típusának megadása kötelező!'
            ],
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            editFieldDisabled: false,
            alert: false,
            szlaKonyvItem: '',                              // Ha számlakönyvelésről van szó, a könyvelendő tétel
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const konyvelesiEvek = await this.$axios.get('http://localhost:8080/alapadatok/konyvelesi_evek');
                    this.evek = konyvelesiEvek.data;
                    this.kiadasEve = this.evek[0].konEv;
                    const kiadasTipusok = await this.$axios.get('http://localhost:8080/alapadatok/domains/KIADTIPUS');
                    this.tipusok = kiadasTipusok.data;
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/B');
                    this.szamlak = szamlakRes.data;
                    this.osszesKiadasFormUpdate(this.kiadasEve);
                } catch(e) {
                    alert(e)
                }
            },
            async osszesKiadasFormUpdate(ev) {             // Táblázat feltöltése az adott év bevételeivel
                try {
                    const kiadasok = await this.$axios.get('http://localhost:8080/kiadasok/' + ev);
                    this.tetelek = kiadasok.data;
                } catch(e) {
                    alert(e)
                }
            },
            changeKiadasEve(newEv) {                        // Bevétel éve változásakor hajtódik végre
                if (this.kiadasEve != newEv) {
                    this.kiadasEve = newEv;
                    this.osszesKiadasFormUpdate(this.kiadasEve);
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
                        this.addKiadas();
                    } else {
                        this.modifyKiadas();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteKiadas();
                } else if (this.confirmMode === 'K') {
                    this.szamlakonyvKiadas();
                } else if (this.confirmMode === 'L') {
                    this.szamlakonyvTorlesKiadas();
                }
            },
            async addKiadas() {                             // Új tétel fölvétele
                try {
                    await this.$axios.post('http://localhost:8080/kiadasok', this.editedItem);
                    this.close();
                    this.osszesKiadasFormUpdate(this.kiadasEve);
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.kiaDatum = item.kiaDatum;
                this.editedItem.kiaSzoveg = item.kiaSzoveg;
                this.editedItem.kiaOsszeg = item.kiaOsszeg;
                this.editedItem.kiaSzamla = item.kiaSzamla;
                this.editedItem.kiaTipus = item.kiaTipus;
                this.editedItem.kiaMddat = item.kiaMddat;
                if (item.kiaSzlaKonyv) {
                    this.editFieldDisabled = true;
                }
                this.dialog = true
            },
            async modifyKiadas() {                          // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/kiadasok/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesKiadasFormUpdate(this.kiadasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                if (item.kiaSzlaKonyv) {
                    this.uzenetText = Util.nemTorolheto;
                    this.alert = true;
                } else {
                    this.torlItem = item
                    this.confirmOpen = true
                    this.confirmMode = 'T'
                }
            },
            async deleteKiadas() {                          // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/kiadasok/delete/' + this.torlItem.id + '/' + this.torlItem.kiaMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesKiadasFormUpdate(this.kiadasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return moment(date).format('YYYY.MM.DD');
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
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
            szamlaKonyveles(item) {                         // Tétel számlakönyvelése
                this.szlaKonyvItem = item
                if (this.szlaKonyvItem.kiaSzlaKonyv) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlakonyvKiadas() {                     // Számlakönyvelés végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/kiadasok/szamlakonyveles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.kiaMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesKiadasFormUpdate(this.kiadasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async szamlakonyvTorlesKiadas() {               // Számlakönyvelés törlésének végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/kiadasok/szamlakonytorles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.kiaMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesKiadasFormUpdate(this.kiadasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
        },
        computed: {
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új kiadás adatsor fölvitele' : 'Kiadás adatsor adatainak módosítása';
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.kiaDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.kiaDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.kiaDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.kiaDatum = value;
                },
            },
            rulesKiaDatum () {                              // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kiadás dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                const rule3 = v => (v && v.substr(0,4) === this.kiadasEve) || 'Csak a kiadás évebeli dátum lehet!';
                rules.push(rule1);
                rules.push(rule2);
                rules.push(rule3);
                return rules;
            },
            rulesKiaOsszeg () {                             // A bevétel összegére vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kiadás összegének kitöltése kötelező!';
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

<style scoped>
.item-size >>> td {
    font-size: 0.8rem !important;
}
</style>