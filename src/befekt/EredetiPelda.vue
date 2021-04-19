<!-- Vue HTML Markup -->

<template>
  <v-menu>
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
      >
        Click me
      </v-btn>
    </template>

    <v-list>
      <v-list-item @click="method">
        <v-list-item-title>Option 1</v-list-item-title>
      </v-list-item>
      <v-list-item disabled>
        <v-list-item-title>Option 2</v-list-item-title>
      </v-list-item>
      <v-list-item @click="method">
        <v-list-item-title>Option 3</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>
<style>
</style>