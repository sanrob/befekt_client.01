<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="devKod"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Devizanemek karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialogOpen"
                    max-width="600px"
                >
                    <template v-slot:activator="{ on }">
                        <v-btn color="primary" class="mb-2" v-on="on">Új tétel</v-btn>
                    </template>
                    <v-card>
                        <v-card-title>
                            <span class="headline">{{ formTitle }}</span>
                        </v-card-title>
                        <v-card-subtitle>
                            <span class="caption">Devizanemek karbantartása</span>
                        </v-card-subtitle>
                        <v-card-text>
                            <v-form
                                v-model="formValid"
                                ref="form"
                            >
                                <v-container>
                                    <v-row>
                                        <v-col cols="4">
                                            <v-text-field
                                                v-model="editedItem.devKod"
                                                v-mask="'AAA'"
                                                :rules="rulesDevKod"
                                                label="Devizanem kódja"
                                                :disabled="codeEditable">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-text-field
                                                v-model="editedItem.devMegnev"
                                                :rules="megnevRules"
                                                label="Devizanem megnevezése">
                                            </v-text-field>
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
                <span>Devizanem adatainak módosítása</span>
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
                <span>Devizanem törlése</span>
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
                {   text: 'Devizanem kódja',
                    value: 'devKod',
                    align: 'start',
                    sortable: true,
                    width: '30%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Devizanem megnevezése', 
                    value: 'devMegnev',
                    width: '50%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            dialogOpen: false,                              // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                devKod: '',
                devMegnev: '',
                devMddat: '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                devKod: '',
                devMegnev: '',
                devMddat: '',
            },
            editedIndex: -1,                                // A táblázat mely sora áll editálás alatt
            formValid: false,                               // A Form(Dialog) adatai összességéban validak-e
            confirmMode: 'F',                               // Confirm panel adatait határozza meg.
            torlItem: '',                                   // Ha tétel törlésről van szó, a törlendő tétel
            megnevRules: [                                  // Szöveg mező validációs eljárásai
                v => !!v || 'Megnevezés kitöltése kötelező!'
            ],
            alert: false,
        }),
        methods: {
            async osszesDevizanemekFormUpdate() {           // Táblázat feltöltése az adott év bevételeivel
                try {
                    const devizanemek = await this.$axios.get('http://localhost:8080/devizanemek/');
                    this.tetelek = devizanemek.data;
                } catch(e) {
                    alert(e)
                }
            },
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    this.osszesDevizanemekFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            async addDevizanem() {                          // Új tétel fölvétele
                try {
                    const adat = await this.$axios.post('http://localhost:8080/devizanemek', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesDevizanemekFormUpdate();
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
                        this.addDevizanem();
                    } else {
                        this.modifyDevizanem();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteDevizanem();
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.devKod = item.devKod;
                this.editedItem.devMegnev = item.devMegnev;
                this.editedItem.devMddat = item.devMddat;
                this.dialogOpen = true
            },
            async modifyDevizanem() {                       // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/devizanemek/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesDevizanemekFormUpdate();
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
            async deleteDevizanem() {                       // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/devizanemek/delete/' + this.torlItem.id + '/' + this.torlItem.devMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesDevizanemekFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
        },
        computed: {
            codeEditable () {                                // Devizanem kódja editálható-e
                return this.editedIndex === -1 ? false : true;
            },
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új devizanem adatsor fölvitele' : 'Devizanem adatsor adatainak módosítása';
            },
            rulesDevKod () {                                // A devizanem kódjára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Devizanem kódjának megadása kötelező!';
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
