<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="szaKod"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Számlák karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialogOpen"
                    max-width="850px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Számlák karbantartása</span>
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
                                                v-model="editedItem.szaKod"
                                                v-mask="'AAA'"
                                                :rules="rulesSzaKod"
                                                label="Számla kódja"
                                                :disabled="editFieldDisabled">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="6">
                                            <v-text-field
                                                v-model="editedItem.szaMegnev"
                                                :rules="megnevRules"
                                                label="Számla megnevezése">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="4">
                                            <v-select 
                                                label="Számla típusa"
                                                :items="szlaTipusok"
                                                item-text="domMegnev"
                                                item-value="domKod"
                                                v-model="editedItem.szaSzlatip"
                                                :rules="szlatipRules"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <v-select 
                                                label="Pénzintézet"
                                                :items="penzIntezetek"
                                                item-text="szvMegnev"
                                                item-value="szvKod"
                                                v-model="editedItem.szaPenzint"
                                                :rules="penzintRules"
                                                :disabled="editFieldDisabled"
                                            >
                                            </v-select>
                                        </v-col>
                                         <v-col cols="6">
                                            <v-select 
                                                label="Deviza"
                                                :items="devNemek"
                                                item-text="devMegnev"
                                                item-value="devKod"
                                                v-model="editedItem.szaDeviza"
                                                :rules="devizaRules"
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
                <span>Számla adatainak módosítása</span>
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
                <span>Számla törlése</span>
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
                {   text: 'Számla kódja',
                    value: 'szaKod',
                    align: 'start',
                    sortable: true,
                    width: '13%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Számla megnevezése', 
                    value: 'szaMegnev',
                    width: '30%',
                },
                {   text: 'Számla típusa', 
                    value: 'szaSzlatipNev',
                    width: '20%',
                },
                {   text: 'Pénzintézet', 
                    value: 'szaPenzintNev',
                    width: '15%',
                },
                {   text: 'Deviza', 
                    value: 'szaDevizaNev',
                    width: '15%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            szlaTipusok: [],                                // A lehetséges számla típusok
            penzIntezetek: [],                              // A lehetséges pénzintézetek
            devNemek: [],                                   // A lehetséges devizanemek
            dialogOpen: false,                              // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                szaKod: '',
                szaMegnev: '',
                szaSzlatip: '',
                szaPenzint: '',
                szaDeviza: '',
                szaMddat : '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                szaKod: '',
                szaMegnev: '',
                szaSzlatip: '',
                szaPenzint: '',
                szaDeviza: '',
                szaMddat : '',
            },
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            megnevRules: [                                  // Számla megnevezése mező validációs eljárásai
                v => !!v || 'Megnevezés kitöltése kötelező!'
            ],
            szlatipRules: [                                 // Számla típus mező validációs eljárásai
                v => !!v || 'Számla típus kitöltése kötelező!'
            ],
            penzintRules: [                                 // Pénzintézet mező validációs eljárásai
                v => !!v || 'Pénzintézet kitöltése kötelező!'
            ],
            devizaRules: [                                  // Deviza mező validációs eljárásai
                v => !!v || 'Deviza kitöltése kötelező!'
            ],
            alert: false,
        }),
        methods: {
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    const szlaTips = await this.$axios.get('http://localhost:8080/alapadatok/domains/SZLATIP');
                    this.szlaTipusok = szlaTips.data;
                    const penzInts = await this.$axios.get('http://localhost:8080/szamlavezetok');
                    this.penzIntezetek = penzInts.data;
                    const devNems = await this.$axios.get('http://localhost:8080/devizanemek');
                    this.devNemek = devNems.data;
                    this.osszesSzamlaFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            async osszesSzamlaFormUpdate() {                // Táblázat feltöltése az összes számla adataival
                try {
                    const szamlas = await this.$axios.get('http://localhost:8080/szamlas');
                    this.tetelek = szamlas.data;
                } catch(e) {
                    alert(e)
                }
            },
            async addSzamla() {                             // Új számla fölvétele
                try {
                    const adat = await this.$axios.post('http://localhost:8080/szamlas', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesSzamlaFormUpdate();
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
                        this.addSzamla();
                    } else {
                        this.modifySzamla();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteSzamla();
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.szaKod = item.szaKod;
                this.editedItem.szaMegnev = item.szaMegnev;
                this.editedItem.szaSzlatip = item.szaSzlatip;
                this.editedItem.szaPenzint = item.szaPenzint;
                this.editedItem.szaDeviza = item.szaDeviza;
                this.editedItem.szaMddat = item.szaMddat;
                this.dialogOpen = true
            },
            async modifySzamla() {                          // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/szamlas/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesSzamlaFormUpdate();
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
            async deleteSzamla() {                          // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/szamlas/delete/' + this.torlItem.id + '/' + this.torlItem.szaMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesSzamlaFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
        },
        computed: {
            rulesSzaKod () {                                // A számla kódjára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Számla kódjának megadása kötelező!';
                rules.push(rule1);
                return rules;
            },
            editFieldDisabled () {                          // Devizanem kódja editálható-e
                return this.editedIndex === -1 ? false : true;
            },
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új számla adatsor fölvitele' : 'Számla adatsor adatainak módosítása';
            },
        },
        watch: {
        },
    }
</script>

<style>
</style>
