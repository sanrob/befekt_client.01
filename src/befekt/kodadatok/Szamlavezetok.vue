<template>
    <v-data-table
        :headers="headers"
        :items="tetelek"
        sort-by="szvKod"
        class="elevation-10"
        dense
    >
        <template v-slot:top>
            <v-toolbar 
                dense 
                flat 
                color="yellow"
            >
                <v-toolbar-title>Szamlavezetők karbantartása</v-toolbar-title>
                <v-divider
                    class="mx-4"
                    inset
                    vertical
                ></v-divider>
                <v-spacer></v-spacer>
                <v-dialog
                    persistent
                    v-model="dialog"
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
                            <span class="caption">Számlavezetők karbantartása</span>
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
                                                v-model="editedItem.szvKod"
                                                v-mask="'AAA'"
                                                :rules="rulesSzvKod"
                                                label="Számlavezető kódja"
                                                :disabled="codeEditable">
                                            </v-text-field>
                                        </v-col>
                                        <v-col cols="8">
                                            <v-text-field
                                                v-model="editedItem.szvMegnev"
                                                :rules="megnevRules"
                                                label="Számlavezető megnevezése">
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
                <span>Számlavezető adatainak módosítása</span>
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
                <span>Számlavezető törlése</span>
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
                {   text: 'Számlavezető kódja',
                    value: 'szvKod',
                    align: 'start',
                    sortable: true,
                    width: '30%',                           // Oszlopszélesség. Az összes oszlopot véve ez hány %
                },
                {   text: 'Számlavazető megnevezése', 
                    value: 'szvMegnev',
                    width: '50%',
                },
                {   text: 'Műveletek',
                    value: 'action',
                    sortable: false,
                },
            ],
            tetelek: [],                                    // A táblázat tétel adatai
            dialog: false,                                  // Új tétel/Módosítás dialog nyitás vezérlője
            confirmOpen: false,                             // Megerősítő dialog nyitás vezérlője
            editedItem: {                                   // Editálandó mezők adatai
                id: '',
                szvKod: '',
                szvMegnev: '',
                szvMddat : '',
            },
            defaultItem: {                                  // Editálandó mezők default értékei
                id: '',
                szvKod: '',
                szvMegnev: '',
                szvMddat : '',
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
            async osszesSzamlavezetokFormUpdate() {         // Táblázat feltöltése az adott év bevételeivel
                try {
                    const szamlavezetok = await this.$axios.get('http://localhost:8080/szamlavezetok/');
                    this.tetelek = szamlavezetok.data;
                } catch(e) {
                    alert(e)
                }
            },
            async initialize () {                           // A kezdő panel létrehozásakor hajtódik végre.
                try {
                    this.osszesSzamlavezetokFormUpdate();
                } catch(e) {
                    alert(e)
                }
            },
            async addSzamlavezeto() {                        // Új tétel fölvétele
                try {
                    const adat = await this.$axios.post('http://localhost:8080/szamlavezetok', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesSzamlavezetokFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
            close () {                                      // Mégse gombra végrehajtandó
                this.$refs.form.reset();                    // Validáció alapra állítása
                this.editedItem = Object.assign({}, this.defaultItem)
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
                        this.addSzamlavezeto();
                    } else {
                        this.modifySzamlavezeto();
                    }
                } else if (this.confirmMode === 'T') {
                    this.deleteSzamlavezeto();
                }
            },
            editItem (item) {                               // Tétel módosításánál editálandó mezők beállítása
                this.editedIndex = this.tetelek.indexOf(item)
                this.editedItem.id = item.id;
                this.editedItem.szvKod = item.szvKod;
                this.editedItem.szvMegnev = item.szvMegnev;
                this.editedItem.szvMddat = item.szvMddat;
                this.dialog = true
            },
            async modifySzamlavezeto() {                    // Korábbi tétel módosítása
                try {
                    const adat = await this.$axios.put('http://localhost:8080/szamlavezetok/update', this.editedItem);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                        this.close();
                    } else {
                        this.close();
                        this.osszesSzamlavezetokFormUpdate();
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
            async deleteSzamlavezeto() {                    // Tényleges törlés kezdeményezése
                try {
                    const adat = await this.$axios.delete(
                        'http://localhost:8080/szamlavezetok/delete/' + this.torlItem.id + '/' + this.torlItem.szvMddat);
                    if (adat.status === 208) {
                        this.uzenetText = adat.data;
                        this.alert = true;
                    } else {
                        this.osszesSzamlavezetokFormUpdate();
                    }
                } catch(e) {
                    alert(e)
                }
            },
        },
        computed: {
            codeEditable () {                               // Számlavezető kódja editálható-e
                return this.editedIndex === -1 ? false : true;
            },
            formTitle () {                                  // Dialog panel címsora
                return this.editedIndex === -1
                    ? 'Új számlavezető adatsor fölvitele' : 'Számlavezető adatsor adatainak módosítása';
            },
            rulesSzvKod () {                                // A számlavezető kódjára vonatkozó validációs szabályok
                const rules = [];
                const rule1 = v => !!v || 'Számlavezető kódjának megadása kötelező!';
                rules.push(rule1);
                return rules;
            },
        },
        watch: {
        },
    }
</script>

<style>
</style>
