<template>
    <v-data-table
        id="table1"
        :headers="headers"
        :items="tetelek"
        :sort-by="['bezDatum', 'bezAzon']"
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
                <v-toolbar-title>Zárási pozíció karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-menu 
                    offset-y
                    max-width=90
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">{{ zarasEve }}</v-btn>
                    </template>
                    <v-list
                        dense
                        max-height="200px"
                        class="overflow-y-auto"
                    >
                        <v-list-item
                            v-for="(ev) in evek"
                            :key="ev.konEv"
                            @click="changeZarasEve(ev.konEv)"
                        >
                            <v-list-item-title>{{ ev.konEv }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-toolbar-title class="ml-3">(zárás éve)</v-toolbar-title>
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
                            <span class="caption">Zárási pozíció karbantartása</span>
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
                                                v-model="menuBez"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Zárás dátuma"
                                                        v-model="formatEditDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesZarDatum"
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
                                        <v-col cols="6">
                                            <v-select 
                                                label="Befektetés egyed"
                                                :items="befektFajtak"
                                                item-text="bffMegnev"
                                                item-value="bffKod"
                                                v-model="selectedBeffajta"
                                                return-object
                                                :rules="befFajtaRules"
                                                @change="valueChangeBefEgyed"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="3">
                                            <v-menu
                                                offset-x
                                                v-model="menuKonyv"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Könyvelés dátuma"
                                                        v-model="formatKonyvelesDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesKonyvDatum"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="konyvelesPickerInput"
                                                    locale="hu-HU"
                                                    @input="menuKonyv = false"
                                                ></v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="5">
                                            <v-select 
                                                label="Elszámolási számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.bezElszSzla"
                                                :rules="elszSzamlaRules"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="5">
                                            <v-select 
                                                label="Jutalék elszámolási számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.bezJutSzla"
                                                :rules="jutSzamlaRules"
                                            >
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Darabszám" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezDarab"
                                                @change="valueChangedDbArf"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Árfolyam" 
                                                :rules="rulesArfolyamAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezArfolyam"
                                                locale='hu-HU'
                                                :decimalLength=6
                                                :defaultValue=0
                                                @change="valueChangedDbArf"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Érték" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezErtek"
                                                @change="valueChangeErtekJutSzaz"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jutalék %" 
                                                :rules="rulesJutalek"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezJutSzaz"
                                                @change="valueChangeErtekJutSzaz"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jutalék érték" 
                                                :rules="rulesJutalek"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezJutErtek"
                                                @change="valueChangeJutErtek"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Realizált érték" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.bezRealErtek"/>
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
                elevation=10
                dismissible
            >
                {{ uzenetText }}
            </v-alert>
            <nyitas-zaras-parositas
                :dialogNyitZarOpen="nyitZarParDialog"
                :zaroAzonosito="zarAzon"
                :befektetesKod="befKod"
                :befektetesMegnev="befKodNev"
                :zarasDarabszam="zarDarab"
                :eddigiParok="parositasok"
                :parosDarabszam="parDarab"
                @NyitZarPanelBezarasUpdateFalse="nyitasZarasPanelBezaras"
                @NyitZarPanelBezarasUpdateTrue="nyitasZarasPanelBezarasUpdate"
            >
            </nyitas-zaras-parositas>
        </template>
        <template v-slot:item.bezAzon="{ item }">
            <span>{{ item.bezAzon | VMask('N-NNNN/NNNNN') }}</span>
        </template>
        <template v-slot:item.bezDatum="{ item }">
            <span>{{ formatDate(item.bezDatum) }}</span>
        </template>
        <template v-slot:item.bezDarab="{ item }">
            <span>{{ formatNumber(item.bezDarab) }}</span>
        </template>
        <template v-slot:item.bezArfolyam="{ item }">
            <span>{{ formatNumberArf(item.bezArfolyam) }}</span>
        </template>
        <template v-slot:item.bezErtek="{ item }">
            <span>{{ formatNumber(item.bezErtek) }}</span>
        </template>
        <template v-slot:item.bezJutSzaz="{ item }">
            <span>{{ formatNumber(item.bezJutSzaz) }}</span>
        </template>
        <template v-slot:item.bezJutErtek="{ item }">
            <span>{{ formatNumber(item.bezJutErtek) }}</span>
        </template>
        <template v-slot:item.bezRealErtek="{ item }">
            <span>{{ formatNumber(item.bezRealErtek) }}</span>
        </template>
        <template v-slot:item.bezKonyvDat="{ item }">
            <span>{{ formatDate(item.bezKonyvDat) }}</span>
        </template>
        <template v-slot:item.bezKonyvelve="{ item }">
            <v-simple-checkbox v-model="item.bezKonyvelve" disabled></v-simple-checkbox>
        </template>
        <template v-slot:item.bezParDarab="{ item }">
            <span>{{ formatNumber(item.bezParDarab) }}</span>
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
                <span>Zárási pozíció adatainak módosítása</span>
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
                <span>Zárási pozíció törlése</span>
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
                <span>Zárási pozíció könyvelése</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        small
                        class="mr-1"
                        @click="parositas(item)"
                        v-bind="attrs"
                        v-on="on"
                    >
                        mdi mdi-comment-quote
                    </v-icon>
                </template>
                <span>Párosítás nyitási pozícióval</span>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script>
    import Confirm from '../../utils/Confirm.vue';
    import Util from '../../utils/Util.js';
    import moment from 'moment';
    import NyitasZarasParositas from '../../components/NyitasZarasParositas.vue';
    export default {
        components: {
            confirm: Confirm,
            nyitasZarasParositas: NyitasZarasParositas,
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
                bezDatum: '',
                bezBffKod: '',
                bezDarab: '',
                bezArfolyam: '',
                bezErtek: '',
                bezJutSzaz: '',
                bezJutErtek: '',
                bezRealErtek: '',
                bezElszSzla: '',
                bezJutSzla: '',
                bezKonyvDat: '',
                bezMddat: '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                bezDatum: '',
                bezBffKod: '',
                bezDarab: '',
                bezArfolyam: '',
                bezErtek: '',
                bezJutSzaz: '',
                bezJutErtek: '',
                bezRealErtek: '',
                bezElszSzla: '',
                bezJutSzla: '',
                bezKonyvDat: '',
                bezMddat: '',
            },
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Azon.', 
                    value: 'bezAzon',
                    align: 'start',
                    sortable: true,
                    width: '5%',
                },
                {   text: 'Kötés',
                    value: 'bezDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '5%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'K.', 
                    value: 'bezBffKod',
                    width: '4%',
                },
                {   text: 'Bef. megnev.', 
                    value: 'bezBffKodNev',
                    width: '10%',
                },
                {   text: 'Darab', 
                    value: 'bezDarab',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Árf.', 
                    value: 'bezArfolyam',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Érték', 
                    value: 'bezErtek',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Jut./%', 
                    value: 'bezJutSzaz',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Jutalék', 
                    value: 'bezJutErtek',
                    align: 'end',
                    width: '6%',
                },
                {   text: 'Real.Értek', 
                    value: 'bezRealErtek',
                    align: 'end',
                    width: '6%',
                },
                {   text: 'Elszámoló számla', 
                    value: 'bezElszSzlaNev',
                    width: '10%',
                },
                {   text: 'Jutalék számla', 
                    value: 'bezJutSzlaNev',
                    width: '10%',
                },
                {   text: 'Könyv.d.',
                    value: 'bezKonyvDat',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '5%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'K.j.',
                    value: 'bezKonyvelve',
                    width: '4%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Pár.db', 
                    value: 'bezParDarab',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                    width: '7%',
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            evek: [],                                       // A lehetséges könyvelési évek listája
            zarasEve: -1,                                   // A kiválasztott zárás év
            befektFajtak: [],                               // Befektetés fajták lista elemei
            menuBez: false,                                 // A DatePicker mint menü megjelenítés vezérlője zárás dátumára
            menuKonyv: false,                               // A DatePicker mint menü megjelenítés vezérlője könyvelés dátumára
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            befFajtaRules: [                                // Befektetés fajta mező validációs eljárásai
                v => !!v || 'Befektetés egyed megadása kötelező!'
            ],
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            alert: false,
            szlaKonyvItem: '',                              // Ha számlakönyvelésről van szó, a könyvelendő tétel
            nyitZarParDialog: false,
            zarAzon: '',
            befKod: '',
            befKodNev: '',
            zarDarab: 0,
            parDarab: 0,
            parositasok: [],                                // A táblázat tétel adatai
            feBezdatum: '',
            elszSzamlaRules: [                              // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Elszámolási számla kitöltése kötelező!'
            ],
            jutSzamlaRules: [                               // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Jutalék számla kitöltése kötelező!'
            ],
            selectedBeffajta: {},
            szamlak: [],
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const konyvelesiEvek = await this.$axios.get('http://localhost:8080/alapadatok/konyvelesi_evek');
                    this.evek = konyvelesiEvek.data;
                    this.zarasEve = this.evek[0].konEv;
                    const befFajtakRes = await this.$axios.get('http://localhost:8080/befektfajtak/kivalasztashoz');
                    this.befektFajtak = befFajtakRes.data;
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/P');
                    this.szamlak = szamlakRes.data;
                    this.osszesBefektZarasFormUpdate(this.zarasEve);
                } catch(e) {
                    alert(e)
                }
            },
            async osszesBefektZarasFormUpdate(ev) {        // Táblázat feltöltése az adott év bevételeivel
                try {
                    const befektZarasok = await this.$axios.get('http://localhost:8080/befektzarasok/' + ev);
                    this.tetelek = befektZarasok.data;
                } catch(e) {
                    alert(e)
                }
            },
            changeZarasEve(newEv) {                         // Befektetés pozíció zárás éve változásakor hajtódik végre
                if (this.zarasEve != newEv) {
                    this.zarasEve = newEv;
                    this.osszesBefektZarasFormUpdate(this.zarasEve);
                }
            },
            close () {                                      // Mégse gombra végrehajtandó
                this.$refs.form.reset();                    // Validáció alapra állítása
                this.editedItem = Object.assign({}, this.defaultItem)
                this.dialog = false;
                this.editedIndex = -1;
                this.feBezdatum = '';
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
                    this.feBezdatum = '';
                    if (this.editedIndex === -1) {
                        this.addBefektZaras();
                    } else {
                        this.modifyBefektZaras();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteBefektZaras();
                } else if (this.confirmMode === 'K') {
                    this.szamlakonyvBefektetes();
                } else if (this.confirmMode === 'L') {
                    this.szamlakonyvTorlesBefektetes();
                }
            },
            async addBefektZaras() {                        // Új tétel fölvétele
                try {
                    await this.$axios.post('http://localhost:8080/befektzarasok', this.editedItem);
                    this.close();
                    this.osszesBefektZarasFormUpdate(this.zarasEve);
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                if (item.bezKonyvelve) {
                    this.uzenetText = Util.nemModosithato;
                    this.alert = true;
                } else {
                    this.editedIndex = this.tetelek.indexOf(item)
                    this.editedItem.id = item.id;
                    this.editedItem.bezDatum = item.bezDatum;
                    this.editedItem.bezBffKod = item.bezBffKod;
                    this.editedItem.bezDarab = item.bezDarab;
                    this.editedItem.bezArfolyam = item.bezArfolyam;
                    this.editedItem.bezErtek = item.bezErtek;
                    this.editedItem.bezJutSzaz = item.bezJutSzaz;
                    this.editedItem.bezJutErtek = item.bezJutErtek;
                    this.editedItem.bezRealErtek = item.bezRealErtek;
                    this.editedItem.bezElszSzla = item.bezElszSzla;
                    this.editedItem.bezJutSzla = item.bezJutSzla;
                    this.editedItem.bezKonyvDat = item.bezKonyvDat;
                    this.editedItem.bezMddat = item.bezMddat;
                    this.feBezdatum = item.bezDatum;
                    this.selectedBeffajta = this.befektFajtak.find(obj => obj.bffKod == this.editedItem.bezBffKod);
                    this.dialog = true
                }
            },
            async modifyBefektZaras() {                     // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektzarasok/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesBefektZarasFormUpdate(this.zarasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                if (item.bezKonyvelve) {
                    this.uzenetText = Util.nemTorolheto;
                    this.alert = true;
                } else {
                    this.torlItem = item
                    this.confirmOpen = true
                    this.confirmMode = 'T'
                }
            },
            async deleteBefektZaras() {                      // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/befektzarasok/delete/' + this.torlItem.id + '/' + this.torlItem.bezMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektZarasFormUpdate(this.zarasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                if (Math.round(number * 100) === 0) {
                    return '';
                }
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            formatNumberArf(number) {                       // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 6, maximumFractionDigits: 6});
            },
            szamlaKonyveles(item) {                         // Tétel számlakönyvelése
                this.szlaKonyvItem = item
                if (this.szlaKonyvItem.bezKonyvelve) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlakonyvBefektetes() {                 // Számlakönyvelés végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektzarasok/szamlakonyveles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.bezMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektZarasFormUpdate(this.zarasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async szamlakonyvTorlesBefektetes() {           // Számlakönyvelés törlésének végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektzarasok/szamlakonytorles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.bezMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektZarasFormUpdate(this.zarasEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async parositas(item) {
                this.zarAzon = item.bezAzon;
                this.befKod = item.bezBffKod
                this.befKodNev = item.bezBffKodNev
                this.zarDarab = item.bezDarab
                this.parDarab = item.bezParDarab
                try {
                    const eddigiParok = await this.$axios.get('http://localhost:8080/befektzarasok/parositasok/' + this.zarAzon);
                    this.parositasok = eddigiParok.data;
                } catch(e) {
                    alert(e)
                }
                this.nyitZarParDialog = true;
            },
            valueChangeJutErtek() {
                this.editedItem.bezRealErtek = this.editedItem.bezErtek - this.editedItem.bezJutErtek;
            },
            valueChangeErtekJutSzaz() {
                if (this.editedItem.bezJutSzaz) {
                    this.editedItem.bezJutErtek = (this.editedItem.bezErtek * this.editedItem.bezJutSzaz) / 100;
                }
                this.valueChangeJutErtek();
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
            valueChangedDbArf() {
                if (this.editedItem.bezDarab && this.editedItem.bezArfolyam) {
                    this.editedItem.bezErtek = this.editedItem.bezDarab * this.editedItem.bezArfolyam;
                    this.valueChangeErtekJutSzaz();
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
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                if (date) {
                    return moment(date).format('YYYY.MM.DD');
                }
                return '';
            },
            nyitasZarasPanelBezaras() {
                this.nyitZarParDialog = false;
            },
            nyitasZarasPanelBezarasUpdate() {
                this.nyitasZarasPanelBezaras();
                this.osszesBefektZarasFormUpdate(this.zarasEve);
            },
            valueChangeBefEgyed() {
                this.editedItem.bezBffKod = this.selectedBeffajta.bffKod;
                this.editedItem.bezElszSzla = this.selectedBeffajta.bffSzamla;
                this.editedItem.bezJutSzla = this.selectedBeffajta.bffJutSzla;
            },
        },
        computed: {
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új zárás adatsor fölvitele' : 'Zárás adatsor adatainak módosítása';
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.bezDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.bezDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.bezDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.bezDatum = value;
                    if (this.feBezdatum != this.editedItem.bezDatum) {
                        this.feBezdatum = this.editedItem.bezDatum;
                        this.editedItem.bezKonyvDat = this.editedItem.bezDatum;
                    }
                },
            },
            formatKonyvelesDate: {                          // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.bezKonyvDat;
                    if (ret) {
                        ret = this.formatDate(ret);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.bezKonyvDat = value;
                },
            },
            konyvelesPickerInput: {                         // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.bezKonyvDat;
                    if (ret) {
                        ret = ret.substr(0, 10);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.bezKonyvDat = value;
                },
            },
            rulesZarDatum () {                              // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Zárás dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                const rule3 = v => (v && v.substr(0,4) === this.zarasEve) || 'Csak a zárás évebeli dátum lehet!';
                rules.push(rule1);
                rules.push(rule2);
                rules.push(rule3);
                return rules;
            },
            rulesKonyvDatum () {                            // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Könyvelés dátumának megadása kötelező!';
                const rule2 = v => ((!this.editedItem.bezDatum)
                        || this.formatDate(new Date(v)) >= this.formatDate(new Date(this.editedItem.bezDatum)))
                    || 'Nem lehet a befektetés zárás dátumánál kisebb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesOsszegAdat () {                            // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Csak pozitív összeg érték megengedett!';
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
            rulesJutalek () {                               // Jutalék mezőkre vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => (!v || (v && !this.negativSzam(v))) || 'Negatív összeg érték megengedett!';
                rules.push(rule2);
                return rules;
            },
        },
        watch: {
        },
    }
</script>

<style>
    #table1 td {
        font-size: 11px;
    }

    #table1 th {
        font-size: 12px !important;
    }
</style>
