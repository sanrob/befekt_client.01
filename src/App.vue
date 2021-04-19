<template>
    <v-app id="inspire">
        <v-navigation-drawer
            v-bind:value="drawer"
            app
            width="340"
        >
            <v-list>
                <v-list-item @click="navigateToMain">
                    <v-list-item-action>
                        <v-icon>mdi-home</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Funkcionalitás</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group
                    no-action
                    prepend-icon="mdi-alpha-k-box-outline"
                    :value="true"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Kód-és Törzsállományok</v-list-item-title>
                    </template>
                    <v-list-item @click="navigateToDevizanemek">
                        <v-list-item-content>
                            <v-list-item-title>Devizanemek</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToSzamlavezetok">
                        <v-list-item-content>
                            <v-list-item-title>Számlavezetők</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToSzamlak">
                        <v-list-item-content>
                            <v-list-item-title>Számlák</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToBefektEgyedek">
                        <v-list-item-content>
                            <v-list-item-title>Befektetési Egyedek</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    no-action
                    prepend-icon="mdi-alpha-a-box-outline"
                    :value="false"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Alapadatok</v-list-item-title>
                    </template>
                    <v-list-item @click="navigateToDevizaArfolyamok">
                        <v-list-item-content>
                            <v-list-item-title>Devizaárfolyamok</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToBefektetesArfolyamok">
                        <v-list-item-content>
                            <v-list-item-title>Befektetés árfolyamok</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToHavKiadTerv">
                        <v-list-item-content>
                            <v-list-item-title>Havi kiadás tervezet</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    no-action
                    prepend-icon="mdi-alpha-b-box-outline"
                    :value="false"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Befektetések</v-list-item-title>
                    </template>
                    <v-list-item @click="navigateToBevetelek">
                        <v-list-item-content>
                            <v-list-item-title>Bevételek</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToTranszferek">
                        <v-list-item-content>
                            <v-list-item-title>Számla transzfer</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToBefektNyitasa">
                        <v-list-item-content>
                            <v-list-item-title>Befektetés nyitása</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToBefektZarasa">
                        <v-list-item-content>
                            <v-list-item-title>Befektetés zárása</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToSzamlaKiadasok">
                        <v-list-item-content>
                            <v-list-item-title>Számlakiadások</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToHaviKiadasok">
                        <v-list-item-content>
                            <v-list-item-title>Havi kiadások</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToPenzForgParositas">
                        <v-list-item-content>
                            <v-list-item-title>Pénzforgalmi párosítás</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                <v-list-group
                    no-action
                    prepend-icon="mdi-alpha-m-box-outline"
                    :value="false"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Kimutatások</v-list-item-title>
                    </template>
                    <v-list-item @click="navigateToBefektKimut">
                        <v-list-item-content>
                            <v-list-item-title>Befektetések napi egyenlege</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToSzamlaKimut">
                        <v-list-item-content>
                            <v-list-item-title>Számlák hó végi egyenlege</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                    <v-list-item @click="navigateToVagyonKimut">
                        <v-list-item-content>
                            <v-list-item-title>Hó végi vagyonkimutatás</v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-icon color="red">mdi-yin-yang</v-icon>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-group>
                <v-list-item @click="navigateToEredetiPelda">
                    <v-list-item-action>
                        <v-icon color="red">mdi-yin-yang</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title>Eredeti Példa</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-group
                    prepend-icon="mdi-alarm-multiple"
                    :value="false"
                >
                    <template v-slot:activator>
                        <v-list-item-title>Users</v-list-item-title>
                    </template>
                    <v-list-group
                        no-action
                        sub-group
                        :value="true"
                    >
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title>Admin</v-list-item-title>
                            </v-list-item-content>
                        </template>
                        <v-list-item
                            v-for="(admin, i) in admins"
                            :key="i"
                        >
                            <v-list-item-title v-text="admin[0]"></v-list-item-title>
                            <v-list-item-icon>
                                <v-icon v-text="admin[1]"></v-icon>
                            </v-list-item-icon>
                        </v-list-item>
                    </v-list-group>
                    <v-list-group
                        sub-group
                        no-action
                    >
                        <template v-slot:activator>
                            <v-list-item-content>
                                <v-list-item-title>Actions</v-list-item-title>
                            </v-list-item-content>
                        </template>
                        <v-list-item
                            v-for="(crud, i) in cruds"
                            :key="i"
                            v-on:click.prevent=""
                        >
                            <v-list-item-title v-text="crud[0]"></v-list-item-title>
                            <v-list-item-action>
                                <v-icon v-text="crud[1]"></v-icon>
                            </v-list-item-action>
                        </v-list-item>
                    </v-list-group>
                </v-list-group>
            </v-list>
        </v-navigation-drawer>
        <v-app-bar
            app
            color="green"
            dark
        >
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
            <v-toolbar-title>Befektetés Nyilvántartó Rendszer</v-toolbar-title>
        </v-app-bar>
        <v-main>
            <v-container
                fluid
            >
                <router-view></router-view>
                <hr>
            </v-container>
        </v-main>
        <v-footer
            color="indigo"
            app
        >
            <v-spacer></v-spacer>
            <div>&copy; {{ new Date().getFullYear() }}</div>
        </v-footer>
    </v-app>
</template>

<script>
  export default {
    data: () => ({
        drawer: true,
        admins: [
            ['Management', 'mdi-people_outline'],
            ['Settings', 'mdi-settings'],
        ],
        cruds: [
            ['Create', 'mdi-add'],
            ['Read', 'mdi-insert_drive_file'],
            ['Update', 'mdi-update'],
            ['Delete', 'mdi-delete'],
        ],
    }),
    methods: {
      navigateToMain () {
        this.$router.push('/');
      },
      navigateToDevizanemek () {
        this.$router.push('/kodadatok/devizanemek');
      },
      navigateToSzamlavezetok () {
        this.$router.push('/kodadatok/szamlavezetok');
      },
      navigateToSzamlak () {
        this.$router.push('/kodadatok/szamlak');
      },
      navigateToBefektEgyedek () {
        this.$router.push('/kodadatok/befektegyedek');
      },
      navigateToDevizaArfolyamok () {
        this.$router.push('/alapadatok/devizaarfolyamok');
      },
      navigateToBefektetesArfolyamok () {
        this.$router.push('/alapadatok/befektetesarfolyamok');
      },
      navigateToHavKiadTerv () {
        this.$router.push('/alapadatok/havkiadterv');
      },
      navigateToBevetelek () {
        this.$router.push('/befektetesek/bevetelek');
      },
      navigateToTranszferek () {
        this.$router.push('/befektetesek/transzferek');
      },
      navigateToBefektNyitasa () {
        this.$router.push('/befektetesek/befektetesek');
      },
      navigateToBefektZarasa () {
        this.$router.push('/befektetesek/befektzarasok');
      },
      navigateToSzamlaKiadasok () {
        this.$router.push('/befektetesek/szamlakiadasok');
      },
      navigateToHaviKiadasok () {
        this.$router.push('/befektetesek/havikiadasok');
      },
      navigateToPenzForgParositas () {
        this.$router.push('/befektetesek/penzforgpar');
      },
      navigateToBefektKimut () {
        this.$router.push('/kimutatasok/befegyenleg');
      },
      navigateToSzamlaKimut () {
        this.$router.push('/kimutatasok/szlaegyenleg');
      },
      navigateToVagyonKimut () {
        this.$router.push('/kimutatasok/vagyon');
      },
      navigateToEredetiPelda () {
        this.$router.push('/alapadatok/eredetipelda');
      }
    }
  }
</script>

<style>
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
   font-size:13px !important;
}
</style>