<template>
    <v-data-table
        id="table1"
        :headers="headers"
        :items="tetelek"
        :sort-by="['befDatum', 'befAzon']"
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
                <v-toolbar-title>Nyitási pozíció karbantartása</v-toolbar-title>
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
                        <v-btn color="primary" class="mb-2" v-on="on">{{ befektetesEve }}</v-btn>
                    </template>
                    <v-list
                        dense
                        max-height="200px"
                        class="overflow-y-auto"
                    >
                        <v-list-item
                            v-for="(ev) in evek"
                            :key="ev.konEv"
                            @click="changeBefektetesEve(ev.konEv)"
                        >
                            <v-list-item-title>{{ ev.konEv }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-toolbar-title class="ml-3">(nyitás éve)</v-toolbar-title>
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
                            <span class="caption">Nyitási pozíció karbantartása</span>
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
                                                v-model="menuBef"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Nyitás dátuma"
                                                        v-model="formatEditDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesBefDatum"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="formatPickerInput"
                                                    locale="hu-HU"
                                                    @input="menuBef = false"
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
                                                        v-model="formatZarasDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesKonyvDatum"
                                                    ></v-text-field>
                                                </template>
                                                <v-date-picker
                                                    width="250"
                                                    v-model="zarasPickerInput"
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
                                                v-model="editedItem.befElszSzla"
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
                                                v-model="editedItem.befJutSzla"
                                                :rules="jutSzamlaRules"
                                            >
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Darabszám" 
                                                :rules="rulesDarabszamAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befDarab"
                                                @change="valueChangedDbArf"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Árfolyam" 
                                                :rules="rulesArfolyamAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befArfolyam"
                                                locale='hu-HU'
                                                :decimalLength=6
                                                :defaultValue=0
                                                @change="valueChangedDbArf"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Érték" 
                                                :rules="rulesErtekAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befErtek"
                                                @change="valueChangeErtekJutSzaz"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jutalék %" 
                                                :rules="rulesErtekAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befJutSzaz"
                                                @change="valueChangeErtekJutSzaz"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jutalék érték" 
                                                :rules="rulesErtekAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befJutErtek"
                                                @change="valueChangeJutErtek"/>
                                        </v-col>
                                        <v-col cols="2">
                <v-badge
                color="green"
                content="6"
            >
                                            <v-currency-field 
                                                label="Bekerülési érték" 
                                                :rules="rulesErtekAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.befBekerErtek"/>
            </v-badge>
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
            <osztalek-nyilvantartas
                :osztalekDialogOpen="osztalekDialogOpen"
                :adoSzamlak="szamlakOsztalek"
                :osztalekBeallitoRec="osztalekBeallito"
                @OsztalekDialogBezar="osztalekDialogClose">
            </osztalek-nyilvantartas>
            <hataridos-elszamolas
                :dialogHatElszOpen="hataridosElszDialog"
                :eddigiElszamolasok="elszamolasok"
                :tartKovSzamlak="szamlakHatelsz"
                :befektTetel="befektHatEleszHez"
                @HatElszPanelBezarasUpdateFalse="hataridosElszPanelBezaras"
            >
            </hataridos-elszamolas>
        </template>
        <template v-slot:item.befAzon="{ item }">
            <span>{{ item.befAzon | VMask('N-NNNN/NNNNN') }}</span>
        </template>
        <template v-slot:item.befDatum="{ item }">
            <span>{{ formatDate(item.befDatum) }}</span>
        </template>
        <template v-slot:item.befDatum="{ item }">
            <span>{{ formatDate(item.befDatum) }}</span>
        </template>
        <template v-slot:item.befBffKod="{ item }">
                <v-badge
                color="green"
                content="6"
                :value="item.befBffTip"
            >
                {{ item.befBffKod }}
            </v-badge>
        </template>
        <template v-slot:item.befArfolyam="{ item }">
            <span>{{ formatNumberArf(item.befArfolyam) }}</span>
        </template>
        <template v-slot:item.befErtek="{ item }">
            <span>{{ formatNumber(item.befErtek) }}</span>
        </template>
        <template v-slot:item.befJutSzaz="{ item }">
            <span>{{ formatNumber(item.befJutSzaz) }}</span>
        </template>
        <template v-slot:item.befJutErtek="{ item }">
            <span>{{ formatNumber(item.befJutErtek) }}</span>
        </template>
        <template v-slot:item.befBekerErtek="{ item }">
            <span>{{ formatNumber(item.befBekerErtek) }}</span>
        </template>
        <template v-slot:item.befKonyvDat="{ item }">
            <span>{{ formatDate(item.befKonyvDat) }}</span>
        </template>
        <template v-slot:item.befKonyvelve="{ item }">
            <v-simple-checkbox v-model="item.befKonyvelve" disabled></v-simple-checkbox>
        </template>
        <template v-slot:item.befLezDat="{ item }">
            <span>{{ formatDate(item.befLezDat) }}</span>
        </template>
        <template v-slot:item.befParDarab="{ item }">
            <span>{{ formatNumber(item.befParDarab) }}</span>
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
                <span>Nyitási pozíció adatainak módosítása</span>
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
                <span>Nyitási pozíció törlése</span>
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
                <span>Nyitási pozíció könyvelése</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        small
                        class="mr-1"
                        @click="osztalekBeallitas(item)"
                        v-bind="attrs"
                        v-on="on"
                    >
                        mdi mdi-alpha-o-box
                    </v-icon>
                </template>
                <span>Osztalék karbantartása és könyvelése</span>
            </v-tooltip>
            <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                    <v-icon
                        small
                        class="mr-1"
                        @click="hatelsz(item)"
                        v-bind="attrs"
                        v-on="on"
                    >
                        mdi mdi-alpha-h-box
                    </v-icon>
                </template>
                <span>Határidős elszámolás</span>
            </v-tooltip>
        </template>
    </v-data-table>
</template>

<script>
    import Confirm from '../../utils/Confirm.vue';
    import Util from '../../utils/Util.js';
    import OsztalekNyilvantartas from '../../components/OsztalekNyilvantartas.vue';
    import HataridosElszamolas from '../../components/HataridosElszamolas.vue';
//    import { VBadge } from 'vuetify/lib/components'  //Globally import VTextField
    import moment from 'moment';
    export default {
        components: {
            confirm: Confirm,
            osztalekNyilvantartas: OsztalekNyilvantartas,
            hataridosElszamolas: HataridosElszamolas,
//            vbadge: VBadge,
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
                befDatum: '',
                befBffKod: '',
                befDarab: '',
                befArfolyam: '',
                befErtek: '',
                befJutSzaz: '',
                befJutErtek: '',
                befBekerErtek: '',
                befElszSzla: '',
                befJutSzla: '',
                befKonyvDat: '',
                befMddat: '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                befDatum: '',
                befBffKod: '',
                befDarab: '',
                befArfolyam: '',
                befErtek: '',
                befJutSzaz: '',
                befJutErtek: '',
                befBekerErtek: '',
                befElszSzla: '',
                befJutSzla: '',
                befKonyvDat: '',
                befMddat: '',
            },
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Azon.', 
                    value: 'befAzon',
                    align: 'start',
                    sortable: true,
                    width: '5%',
                },
                {   text: 'Kötés',
                    value: 'befDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '5%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'K.', 
                    value: 'befBffKod',
                    width: '4%',
                },
                {   text: 'Bef. megnev.', 
                    value: 'befBffKodNev',
                    width: '10%',
                },
                {   text: 'Darab', 
                    value: 'befDarab',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Árf.', 
                    value: 'befArfolyam',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Érték', 
                    value: 'befErtek',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Jut./%', 
                    value: 'befJutSzaz',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Jutalék', 
                    value: 'befJutErtek',
                    align: 'end',
                    width: '6%',
                },
                {   text: 'Bek.Értek', 
                    value: 'befBekerErtek',
                    align: 'end',
                    width: '6%',
                },
                {   text: 'Elszámoló számla', 
                    value: 'befElszSzlaNev',
                    width: '10%',
                },
                {   text: 'Jutalék számla', 
                    value: 'befJutSzlaNev',
                    width: '10%',
                },
                {   text: 'Könyv.d.',
                    value: 'befKonyvDat',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '4%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Könyv.',
                    value: 'befKonyvelve',
                    width: '4%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Lez.', 
                    value: 'befLezDat',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '4%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Pár.db', 
                    value: 'befParDarab',
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
            befektFajtak: [],                               // Befektetés fajták lista elemei
            befektetesEve: -1,                              // A kiválasztott befefektetés év
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            menuBef: false,                                 // A DatePicker mint menü megjelenítés vezérlője befektetés dátumra
            menuKonyv: false,                               // A DatePicker mint menü megjelenítés vezérlője könyvelés dátumra
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            evek: [],                                       // A lehetséges könyvelési évek listája
            befFajtaRules: [                                // Befektetés fajta mező validációs eljárásai
                v => !!v || 'Befektetés egyed megadása kötelező!'
            ],
            alert: false,
            szlaKonyvItem: '',                              // Ha számlakönyvelésről van szó, a könyvelendő tétel
            feBefdatum: '',
            osztalekDialogOpen: false,
            osztalekBeallito: {},
            szamlak: [],
            hataridosElszDialog: false,
            elszamolasok: [],                               // A táblázat tétel adatai
            szamlakOsztalek: [],
            szamlakHatelsz: [],
            befektHatEleszHez: {},
            elszSzamlaRules: [                              // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Elszámolási számla kitöltése kötelező!'
            ],
            jutSzamlaRules: [                               // Elszámolási számla mező validációs eljárásai
                v => !!v || 'Jutalék számla kitöltése kötelező!'
            ],
            selectedBeffajta: {},
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const konyvelesiEvek = await this.$axios.get('http://localhost:8080/alapadatok/konyvelesi_evek');
                    this.evek = konyvelesiEvek.data;
                    this.befektetesEve = this.evek[0].konEv;
                    const befFajtakRes = await this.$axios.get('http://localhost:8080/befektfajtak/kivalasztashoz');
                    this.befektFajtak = befFajtakRes.data;
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/P');
                    this.szamlak = szamlakRes.data;
                   this.osszesBefektetesekFormUpdate(this.befektetesEve);
                } catch(e) {
                    alert(e)
                }
            },
            async osszesBefektetesekFormUpdate(ev) {        // Táblázat feltöltése az adott év bevételeivel
                try {
                    const befektetesek = await this.$axios.get('http://localhost:8080/befektetesek/' + ev);
                    this.tetelek = befektetesek.data;
                } catch(e) {
                    alert(e)
                }
            },
            changeBefektetesEve(newEv) {                    // Bevétel éve változásakor hajtódik végre
                if (this.befektetesEve != newEv) {
                    this.befektetesEve = newEv;
                    this.osszesBefektetesekFormUpdate(this.befektetesEve);
                }
            },
            close () {                                      // Mégse gombra végrehajtandó
                this.$refs.form.reset();                    // Validáció alapra állítása
                this.editedItem = Object.assign({}, this.defaultItem)
                this.dialog = false;
                this.editedIndex = -1;
                this.feBefdatum = '';
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
                    this.feBefdatum = '';
                    if (this.editedIndex === -1) {
                        this.addBefektetes();
                    } else {
                        this.modifyBefektetes();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteBefektetes();
                } else if (this.confirmMode === 'K') {
                    this.szamlakonyvBefektetes();
                } else if (this.confirmMode === 'L') {
                    this.szamlakonyvTorlesBefektetes();
                }
            },
            async addBefektetes() {                         // Új tétel fölvétele
                try {
                    await this.$axios.post('http://localhost:8080/befektetesek', this.editedItem);
                    this.close();
                    this.osszesBefektetesekFormUpdate(this.befektetesEve);
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                if (item.befKonyvelve) {
                    this.uzenetText = Util.nemModosithato;
                    this.alert = true;
                } else {
                    this.editedIndex = this.tetelek.indexOf(item)
                    this.editedItem.id = item.id;
                    this.editedItem.befDatum = item.befDatum;
                    this.editedItem.befBffKod = item.befBffKod;
                    this.editedItem.befDarab = item.befDarab;
                    this.editedItem.befArfolyam = item.befArfolyam;
                    this.editedItem.befErtek = item.befErtek;
                    this.editedItem.befJutSzaz = item.befJutSzaz;
                    this.editedItem.befJutErtek = item.befJutErtek;
                    this.editedItem.befBekerErtek = item.befBekerErtek;
                    this.editedItem.befElszSzla = item.befElszSzla;
                    this.editedItem.befJutSzla = item.befJutSzla;
                    this.editedItem.befKonyvDat = item.befKonyvDat;
                    this.editedItem.befMddat = item.befMddat;
                    this.feBefdatum = item.befDatum;
                    this.selectedBeffajta = this.befektFajtak.find(obj => obj.bffKod == this.editedItem.befBffKod);
                    this.dialog = true
                }
            },
            async modifyBefektetes() {                      // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/befektetesek/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesBefektetesekFormUpdate(this.befektetesEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                if (item.befKonyvelve) {
                    this.uzenetText = Util.nemTorolheto;
                    this.alert = true;
                } else {
                    this.torlItem = item
                    this.confirmOpen = true
                    this.confirmMode = 'T'
                }
            },
            async deleteBefektetes() {                      // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/befektetesek/delete/' + this.torlItem.id + '/' + this.torlItem.befMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektetesekFormUpdate(this.befektetesEve);
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
                if (this.szlaKonyvItem.befKonyvelve) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlakonyvBefektetes() {                 // Számlakönyvelés végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektetesek/szamlakonyveles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.befMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektetesekFormUpdate(this.befektetesEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async szamlakonyvTorlesBefektetes() {           // Számlakönyvelés törlésének végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/befektetesek/szamlakonytorles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.befMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesBefektetesekFormUpdate(this.befektetesEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async osztalekBeallitas(item) {
//                this.itemHozambeallitashoz = item;
                item.id;
/*
                this.zarAzon = item.bezAzon;
                this.befKod = item.bezBffKod
                this.befKodNev = item.bezBffKodNev
                this.zarDarab = item.bezDarab
                this.parDarab = item.bezParDarab
*/
                try {
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/B');
                    this.szamlakOsztalek = szamlakRes.data;
                    const osztalekBeallitoRet = await this.$axios.get('http://localhost:8080/befektetesek/osztalekbeallito/' + item.id);
                    this.osztalekBeallito = osztalekBeallitoRet.data;
                } catch(e) {
                    alert(e)
                }
                this.osztalekDialogOpen = true;
            },
            async hatelsz(item) {
                if (!item.befBffTip) {
                    this.uzenetText = 'Csak határidős pozícióra hívható!';
                    this.alert = true;
                } else {

                this.befektHatEleszHez = item;
/*
                this.zarAzon = item.bezAzon;
                this.befKod = item.bezBffKod
                this.befKodNev = item.bezBffKodNev
                this.zarDarab = item.bezDarab
                this.parDarab = item.bezParDarab
*/
                try {
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas/P');
                    this.szamlakHatelsz = szamlakRes.data;
                    const eddigiElszamolasok = await this.$axios.get(
                        'http://localhost:8080/befektetesek/hataridoselszamolas/' + item.id);
                    this.elszamolasok = eddigiElszamolasok.data;
                } catch(e) {
                    alert(e)
                }
                this.hataridosElszDialog = true;
                }
            },
            hataridosElszPanelBezaras() {
                this.hataridosElszDialog = false;
            },
            osztalekDialogClose() {
                this.osztalekDialogOpen = false;
            },
            valueChangeJutErtek() {
                this.editedItem.befBekerErtek = this.editedItem.befErtek + this.editedItem.befJutErtek;
            },
            valueChangeErtekJutSzaz() {
                if (this.editedItem.befJutSzaz) {
                    this.editedItem.befJutErtek = (this.editedItem.befErtek * this.editedItem.befJutSzaz) / 100;
                }
                this.valueChangeJutErtek();
            },
            valueChangedDbArf() {
                if (this.editedItem.befDarab && this.editedItem.befArfolyam) {
                    this.editedItem.befErtek = this.editedItem.befDarab * this.editedItem.befArfolyam;
                    this.valueChangeErtekJutSzaz();
                }
            },
            negativSzam(v) {
                return this.negativE(v, 2);
            },
            negativE(v, n) {                                // Formázott szám negatív értékű-e
                let val = v.toString().replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * Math.pow(10, n)) / Math.pow(10, n);
                return val < 0 ? true : false;
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
            valueChangeBefEgyed() {
                this.editedItem.befBffKod = this.selectedBeffajta.bffKod;
                this.editedItem.befElszSzla = this.selectedBeffajta.bffSzamla;
                this.editedItem.befJutSzla = this.selectedBeffajta.bffJutSzla;
            },
        },
        computed: {
            badgeVisible(item) {
                return item.befBffTip != "P";
            },
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új nyitás adatsor fölvitele' : 'Nyitás adatsor adatainak módosítása';
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.befDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.befDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.befDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.befDatum = value;
                    if (this.feBefdatum != this.editedItem.befDatum) {
                        this.feBefdatum = this.editedItem.befDatum;
                        this.editedItem.befKonyvDat = this.editedItem.befDatum;
                    }
                },
            },
            formatZarasDate: {                              // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.befKonyvDat;
                    if (ret) {
                        ret = this.formatDate(ret);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.befKonyvDat = value;
                },
            },
            zarasPickerInput: {                             // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.befKonyvDat;
                    if (ret) {
                        ret = ret.substr(0, 10);
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.befKonyvDat = value;
                },
            },
            rulesBefDatum () {                              // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Bevétel dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                const rule3 = v => (v && v.substr(0,4) === this.befektetesEve) || 'Csak a nyitás évebeli dátum lehet!';
                rules.push(rule1);
                rules.push(rule2);
                rules.push(rule3);
                return rules;
            },
            rulesKonyvDatum () {                            // A bevétel dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Könyvelés dátumának megadása kötelező!';
                const rule2 = v => ((!this.editedItem.befDatum)
                        || this.formatDate(new Date(v)) >= this.formatDate(new Date(this.editedItem.befDatum)))
                    || 'Nem lehet a befektetés dátumánál kisebb!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesDarabszamAdat () {                         // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Csak pozitív összeg érték megengedett!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesErtekAdat () {                             // Jutalék mezőkre vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => (!v || (v && !this.negativSzam(v))) || 'Negatív összeg érték nem megengedett!';
                rules.push(rule2);
                return rules;
            },
            rulesArfolyamAdat () {                          // Jutalék mezőkre vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => (!v || (v && !this.negativE(v, 6))) || 'Negatív összeg érték nem megengedett!';
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
        font-size: 5px;
    }

    #table1 th {
        font-size: 7px !important;
    }
</style>
