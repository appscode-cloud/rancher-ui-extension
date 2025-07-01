<script lang="ts"></script>
<template>
  <h1>Hello</h1>
  <p><strong>Current route path:</strong> {{ $route.fullPath }}</p>
  <RouterLink :to="`${$route.fullPath}/postgreSQL`">Go to PG-Create</RouterLink>
  <br />
  <RouterLink :to="`${$route.fullPath}/mongodb`">Go to Mongo-Create</RouterLink>
</template>
