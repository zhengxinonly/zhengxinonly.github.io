<template>
  <Layout>

  </Layout>
</template>

<script lang="ts" setup>
  import DefaultTheme from 'vitepress/theme';
  import { useData } from 'vitepress';

  const { Layout } = DefaultTheme;
  const { page, theme, frontmatter } = useData();
</script>

<style scoped></style>