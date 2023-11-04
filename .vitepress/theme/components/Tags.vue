<script setup>
import {data as posts} from '../utils/posts.data.js';
import {computed, ref} from 'vue'
import {initTags} from '../utils/functions'

let url = location.href.split('?')[1]
let params = new URLSearchParams(url)
const data = computed(() => initTags(posts))
let selectTag = ref(params.get('tag') ? params.get('tag') : '')
const toggleTag = (tag) => {
  selectTag.value = tag
}
</script>

<template>

    <div class="tags">
        <span @click="toggleTag(key)" v-for="(item, key) in data" class="tag">
            {{ key }} <strong>{{ data[key].length }}</strong>
        </span>
    </div>
    <div class="tag-header">{{ selectTag }}</div>
    <a :href="article.url" v-for="(article, index) in data[selectTag]" :key="index" class="posts">
      <div class="post-container">
        <div class="post-dot"></div>
        {{ article.frontmatter.title }}
      </div>
      <div class="date">{{ article.frontmatter.date.slice(0, 10) }}</div>
    </a>
</template>

<style scoped>

.tags {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
}

.tag {
  display: inline-block;
  padding: 4px 16px;
  margin: 6px 8px;
  font-size: 0.875rem;
  line-height: 25px;
  background-color: var(--vp-c-bg-alt);
  transition: 0.4s;
  border-radius: 2px;
  color: var(--vp-c-text-1);
  cursor: pointer;
}

.tag strong {
  color: var(--vp-c-brand);
}

.tag-header {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 1rem 0;
  text-align: left;
}

@media screen and (max-width: 768px) {
  .tag-header {
    font-size: 1.5rem;
  }

  .date {
    font-size: 0.75rem;
  }
}


</style>