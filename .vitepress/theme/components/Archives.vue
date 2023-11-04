<script setup>
import {computed} from "vue";

import {data as posts} from '../utils/posts.data.js';
import {useYearSort} from '../utils/functions'

const data = computed(() => useYearSort(posts))
</script>

<template>
  <div v-for="yearList in data">
    <div class="year">
      {{ yearList[0].frontmatter.date.split('-')[0] }}
    </div>
    <a :href="article.url" v-for="(article, index) in yearList" :key="index" class="posts">
      <div class="post-container">
        <div class="post-dot"></div>
        {{ article.frontmatter.title }}
      </div>
      <div class="date">{{ article.frontmatter.date.slice(5, 10) }}</div>
    </a>
  </div>
</template>

<style scoped>
.year {
  padding: 14px 0 8px 0;
  font-size: 1.25rem;
  font-weight: 500;
  font-family: var(--date-font-family);
}

.posts {
  padding: 4px 0 4px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-dot {
    display: inline-block;
    margin-right: 10px;
    margin-bottom: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background-color: var(--li-dot-color);
}

</style>