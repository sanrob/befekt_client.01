<template>
    <v-data-table
        id="table1"
        :headers="headers"
        :items="tetelek"
        :sort-by="['traDatum', 'traAzon']"
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
                <v-toolbar-title>Számlák közötti transzferek</v-toolbar-title>
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
                        <v-btn color="primary" class="mb-2" v-on="on">{{ transzferEve }}</v-btn>
                    </template>
                    <v-list
                        dense
                        max-height="200px"
                        class="overflow-y-auto"
                    >
                        <v-list-item
                            v-for="(ev) in evek"
                            :key="ev.konEv"
                            @click="changeTranszferEve(ev.konEv)"
                        >
                            <v-list-item-title>{{ ev.konEv }}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-toolbar-title class="ml-3">(transzfer éve)</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialog"
                    max-width="1200px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Számlatranszferek karbantartása</span>
                        </v-card-subtitle>
                        <v-card-text>
                            <v-form
                                v-model="formValid"
                                ref="form"
                            >
                                <v-container>
                                    <v-row>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Honnan számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.traHonnan"
                                                :rules="rulesHonnanSzamla"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Hova számla"
                                                :items="szamlak"
                                                item-text="szaMegnev"
                                                item-value="szaKod"
                                                v-model="editedItem.traHova"
                                                :rules="rulesHovaSzamla"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-text-field
                                                v-model="editedItem.traLeiras"
                                                :rules="leirasRules"
                                                label="Transzfer leírása">
                                            </v-text-field>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="2">
                                            <v-menu
                                                offset-x
                                                v-model="menu"
                                                :close-on-content-click="false"
                                                :nudge-right="10"
                                            >
                                                <template v-slot:activator="{ on, attrs }">
                                                    <v-text-field
                                                        label="Transzfer dátuma"
                                                        v-model="formatEditDate"
                                                        readonly
                                                        v-bind="attrs"
                                                        v-on="on"
                                                        :rules="rulesTranszferDatum"
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
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Terhelés" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.traTerheles"
                                                @change="valueChanged"
                                                :disabled="editFieldDisabled"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Árfolyam" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.traArfolyam"
                                                @change="valueChanged"
                                                :disabled="disabledArfolyam"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jóváírás" 
                                                :rules="rulesOsszegAdat"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.traJovairas"
                                                :disabled="editFieldDisabled"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-currency-field 
                                                label="Jutalék" 
                                                :rules="rulesJutalek"
                                                :error-messages="errors.rate"
                                                v-model="editedItem.traJutalek"
                                                :disabled="editFieldDisabled"/>
                                        </v-col>
                                        <v-col cols="2">
                                            <v-select 
                                                label="Jutalék számlája"
                                                :items="jutKonyvOpciok"
                                                item-text="domMegnev"
                                                item-value="domKod"
                                                v-model="editedItem.traJutKonyv"
                                                :rules="rulesJutalekSzamla"
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
        <template v-slot:item.traAzon="{ item }">
            <span>{{ item.traAzon | VMask('N-NNNN/NNNNN') }}</span>
        </template>
        <template v-slot:item.traDatum="{ item }">
            <span>{{ formatDate(item.traDatum) }}</span>
        </template>
        <template v-slot:item.traTerheles="{ item }">
            <span>{{ formatNumber(item.traTerheles) }}</span>
        </template>
        <template v-slot:item.traArfolyam="{ item }">
            <span>{{ formatNumber(item.traArfolyam) }}</span>
        </template>
        <template v-slot:item.traJovairas="{ item }">
            <span>{{ formatNumber(item.traJovairas) }}</span>
        </template>
        <template v-slot:item.traJutalek="{ item }">
            <span>{{ formatNumber(item.traJutalek) }}</span>
        </template>
        <template v-slot:item.traSzamlaKonyv="{ item }">
            <v-simple-checkbox v-model="item.traSzamlaKonyv" disabled></v-simple-checkbox>
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
                <span>Transzfer adatainak módosítása</span>
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
                <span>Transzfer törlése</span>
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
                <span>Transzfer számlakönyvelése, ill. annak törlése</span>
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
            szamlak: [],                                    // Honnan és hova számlák lista elemei
            evek: [],                                       // A lehetséges könyvelési évek listája
            transzferEve: -1,                               // A transzfer kiválasztott éve
            editFieldDisabled: false,
            menu: false,                                    // A DatePicker mint menü megjelenítés vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                traHonnan: '',
                traHova: '',
                traLeiras: '',
                traDatum: '',
                traTerheles: '',
                traArfolyam: '',
                traJovairas: '',
                traJutalek: '',
                traJutKonyv: '',
                traMddat : '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                traHonnan: '',
                traHova: '',
                traLeiras: '',
                traDatum: '',
                traTerheles: '',
                traArfolyam: '',
                traJovairas: '',
                traJutalek: '',
                traJutKonyv: '',
                traMddat : '',
            },
            headers: [                                      // Táblázat oszlopainak leírása
                {   text: 'Azon.', 
                    value: 'traAzon',
                    width: '8%',
                },
                {   text: 'Honnan számla', 
                    value: 'traHonnanNev',
                    width: '14%',
                },
                {   text: 'Hova számla', 
                    value: 'traHovaNev',
                    width: '14%',
                },
                {   text: 'Szöveges leírás', 
                    value: 'traLeiras',
                    width: '13%',
                },
                {   text: 'Dátum',
                    value: 'traDatum',
                    dataType: "Date",
                    align: 'start',
                    sortable: true,
                    width: '8%',                            // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Terhelés', 
                    value: 'traTerheles',
                    align: 'end',
                    width: '7%',
                },
                {   text: 'Árfolyam', 
                    value: 'traArfolyam',
                    align: 'end',
                    width: '7%',
                },
                {   text: 'Jóváírás', 
                    value: 'traJovairas',
                    align: 'end',
                    width: '7%',
                },
                {   text: 'Jut.', 
                    value: 'traJutalek',
                    align: 'end',
                    width: '5%',
                },
                {   text: 'Jut.sz.', 
                    value: 'traJutKonyvNev',
                    align: 'end',
                    width: '6%',
                },
                {   text: 'S.k.', 
                    value: 'traSzamlaKonyv',
                    width: '4%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            errors: {},                                     // v-currency mezővel kapcsolatos
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            leirasRules: [                                  // Tranzakció leírásának validációs eljárásai
                v => !!v || 'Tranzakció leírásának kitöltése kötelező!'
            ],
            alert: false,
            szlaKonyvItem: '',                              // Ha számlakönyvelésről van szó, a könyvelendő tétel
            jutKonyvOpciok: [],                             // Jutalék könyvelés számlája
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const szamlakRes = await this.$axios.get('http://localhost:8080/szamlas');
                    this.szamlak = szamlakRes.data;
                    const jutKonyvRes = await this.$axios.get('http://localhost:8080/alapadatok/domains/TRAJUTKON');
                    this.jutKonyvOpciok = jutKonyvRes.data;
                    const konyvelesiEvek = await this.$axios.get('http://localhost:8080/alapadatok/konyvelesi_evek');
                    this.evek = konyvelesiEvek.data;
                    this.transzferEve = this.evek[0].konEv;
                    this.osszesTranszferFormUpdate(this.transzferEve);
                } catch(e) {
                    alert(e)
                }
            },
            async osszesTranszferFormUpdate(ev) {           // Táblázat feltöltése az adott év transzfer tételeivel
                try {
                    const transzferek = await this.$axios.get('http://localhost:8080/transzferek/' + ev);
                    this.tetelek = transzferek.data;
                } catch(e) {
                    alert(e)
                }
            },
            changeTranszferEve(newEv) {                     // Bevétel éve változásakor hajtódik végre
                if (this.transzferEve != newEv) {
                    this.transzferEve = newEv;
                    this.osszesTranszferFormUpdate(this.transzferEve);
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
                        this.addTranszfer();
                    } else {
                        this.modifyTranszfer();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteTranszfer();
                } else if (this.confirmMode === 'K') {
                    this.szamlakonyvTranszfer();
                } else if (this.confirmMode === 'L') {
                    this.szamlakonyvTorlesTranszfer();
                }
            },
            async addTranszfer() {                          // Új transzfer tétel fölvétele
                try {
                    await this.$axios.post('http://localhost:8080/transzferek', this.editedItem);
                    this.close();
                    this.osszesTranszferFormUpdate(this.transzferEve);
                } catch(e) {
                    alert(e)
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.traHonnan = item.traHonnan;
                this.editedItem.traHova = item.traHova;
                this.editedItem.traLeiras = item.traLeiras;
                this.editedItem.traDatum = item.traDatum;
                this.editedItem.traTerheles = item.traTerheles;
                this.editedItem.traArfolyam = item.traArfolyam;
                this.editedItem.traJovairas = item.traJovairas;
                this.editedItem.traJutalek = item.traJutalek;
                this.editedItem.traJutKonyv = item.traJutKonyv;
                this.editedItem.traMddat = item.traMddat;
                if (item.traSzamlaKonyv) {
                    this.editFieldDisabled = true;
                }
                this.dialog = true
            },
            async modifyTranszfer() {                       // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/transzferek/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesTranszferFormUpdate(this.transzferEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            deleteItem (item) {                             // Törlés Confirm ablak megnyitása
                if (item.traSzamlaKonyv) {
                    this.uzenetText = Util.nemTorolheto;
                    this.alert = true;
                } else {
                    this.torlItem = item
                    this.confirmOpen = true
                    this.confirmMode = 'T'
                }
            },
            async deleteTranszfer() {                       // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/transzferek/delete/' + this.torlItem.id + '/' + this.torlItem.traMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesTranszferFormUpdate(this.transzferEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            valueChanged() {
                this.editedItem.traJovairas = this.editedItem.traTerheles * this.editedItem.traArfolyam;
            },
            formatDate(date) {                              // Táblázatban dátummező formázott megjelenítése
                return moment(date).format('YYYY.MM.DD');
            },
            formatNumber(number) {                          // Táblázatban összegmező formázott megjelenítése
                return number.toLocaleString('hu-HU',  {minimumFractionDigits: 2, maximumFractionDigits: 2});
            },
            nemNegativSzam(v) {                             // Formázott szám nem negatív értékű-e
                let ret = true;
                let val = v.replace(" ", "");
                val = val.replace(",", ".");
                val = Math.round((parseFloat(val) + Number.EPSILON) * 100) / 100;
                if (val < 0) {
                    ret = false;
                }
                return ret;
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
            setDefaultArafolyam(){
                this.editedItem.traArfolyam = 1;
            },
            szamlaKonyveles(item) {                         // Tétel számlakönyvelése
                this.szlaKonyvItem = item
                if (this.szlaKonyvItem.traSzamlaKonyv) {
                    this.confirmMode = 'L'
                } else {
                    this.confirmMode = 'K'
                }
                this.confirmOpen = true
            },
            async szamlakonyvTranszfer() {                  // Számlakönyvelés végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/transzferek/szamlakonyveles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.traMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesTranszferFormUpdate(this.transzferEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
            async szamlakonyvTorlesTranszfer() {            // Számlakönyvelés törlésének végrehajtása
                try {
                    const adat = await this.$axios.put(
                        'http://localhost:8080/transzferek/szamlakonytorles/' + this.szlaKonyvItem.id + '/' + this.szlaKonyvItem.traMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesTranszferFormUpdate(this.transzferEve);
                    }
                } catch(e) {
                    alert(e)
                }
            },
        },
        computed: {
            rulesJutalek () {                               // Jutalék összegére vonatkozó validációs szabályok
                const rules = [];
                const rule2 = v => (!v || (v && this.nemNegativSzam(v))) || 'Negatív érték nem megengedett!';
                rules.push(rule2);
                return rules;
            },
            disabledArfolyam() {                            // Ha honnan és hova számla egyenlő, árfolyam nem megadható
                var ret = false;
                if (this.editFieldDisabled) {
                    ret = true;
                } else {
                    if (this.editedItem.traHonnan && this.editedItem.traHova) {
                        const szlaHonnan = this.szamlak.find(elem => elem.szaKod === this.editedItem.traHonnan);
                        const szlaHova = this.szamlak.find(elem => elem.szaKod === this.editedItem.traHova);
                        if (szlaHonnan.szaDeviza === szlaHova.szaDeviza) {
                            this.setDefaultArafolyam();
                            ret = true;
                        }
                    }
                }
                return ret;
            },
            rulesOsszegAdat () {                            // Összeg mezőre vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Kitöltése kötelező!';
                const rule2 = v => (v && this.pozitivSzam(v)) || 'Csak pozitív összeg érték megengedett!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új transzfer adatsor fölvitele' : 'Transzfer adatsor adatainak módosítása';
            },
            formatEditDate: {                               // Editált dátumérték megjelenítése
                get: function() {                           // A felületen megjelenítendő értéket adja vissza.
                    let ret = this.editedItem.traDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = this.formatDate(ret);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.traDatum = value;
                },
            },
            formatPickerInput: {                            // A DatePicker input-ját adja vissza az editált mezőértékből
                get: function() {                           // A DatePicker input-ját adja vissza az editált mezőértékből
                    let ret = this.editedItem.traDatum;
                    if (ret) {
                        if (!(ret === "")) {
                            ret = ret.substr(0, 10);
                        }
                    }
                    return ret;
                },
                set: function(value) {                      // Az editált mezőértéket állítja be
                    this.editedItem.traDatum = value;
                },
            },
            rulesTranszferDatum () {                        // A transzfer dátumára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Transzfer dátumának megadása kötelező!';
                const rule2 = v => (v && new Date(v) <= new Date()) || 'Nem lehet a mai napnál nagyobb!';
                const rule3 = v => (v && v.substr(0,4) === this.transzferEve) || 'Csak a transzfer évebeli dátum lehet!';
                rules.push(rule1);
                rules.push(rule2);
                rules.push(rule3);
                return rules;
            },
            rulesHovaSzamla () {                            // A hova számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Hova számla kitöltése kötelező!';
                const rule2 = v => (v && !this.editedItem.traHonnan)
                    || (v && !!this.editedItem.traHonnan && v != this.editedItem.traHonnan)
                    || 'A hova és honnan számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesHonnanSzamla () {                          // A honnan számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Honnan számla kitöltése kötelező!';
                const rule2 = v => (v && !this.editedItem.traHova)
                    || (v && !!this.editedItem.traHova && v != this.editedItem.traHova)
                    || 'A honnan és hova számla nem lehet ugyanaz!';
                rules.push(rule1);
                rules.push(rule2);
                return rules;
            },
            rulesJutalekSzamla () {                         // A honnan számlára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Jutalék számla kitöltése kötelező!';
                rules.push(rule1);
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
        font-size: 13px !important;
    }
</style>
