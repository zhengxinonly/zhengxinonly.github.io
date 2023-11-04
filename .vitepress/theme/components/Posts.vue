<script setup>
import {data as posts} from '../utils/posts.data.js';
import {withBase} from 'vitepress';
import {ref, computed} from 'vue';

const page = ref(1);
const per_page = ref(10);
const total = posts.length;
const pages = total % per_page.value === 0 ? total / per_page.value : parseInt(total / per_page.value) + 1;

const current_posts = computed(() => {
  console.log((page.value - 1) * per_page.value);
  return posts.slice((page.value - 1) * per_page.value, page.value * per_page.value);
});


</script>

<template>
  <ClientOnly>
    <div v-for="(post, index) in current_posts" :key="index" class="post-list">
      <div class="post-header">
        <div class="post-title">
          <a :href="withBase(post.url)"> {{ post.frontmatter.title }}</a>
        </div>
      </div>
      <p class="describe" v-html="post.frontmatter.description"></p>
      <div class='post-info'>
        {{ post.frontmatter.date.slice(0, 10) }} <span v-for="item in post.frontmatter.tags"><a
          :href="withBase(`/tags.html?tag=${item}`)"> {{ item }}</a></span>
      </div>
    </div>
    <div class="pagination">
      <a
          class="link"
          :class="{ active: page === i }"
          v-for="i in pages"
          :key="i"
          @click="page = i"
      >{{ i }}</a>
    </div>
  </ClientOnly>
</template>


<style scoped>
.post-list {
  border-bottom: 1px dashed var(--vp-c-divider-light);
  padding: 14px 0 14px 0;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.post-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0.1rem 0;
}

.post-info {
  font-size: 12px;
}

.post-info span {
  display: inline-block;
  padding: 0 8px;
  background-color: var(--vp-c-bg-alt);
  margin-right: 10px;
  transition: 0.4s;
  border-radius: 2px;
  color: var(--vp-c-text-1);
}

.describe {
  font-size: 0.9375rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  color: var(--vp-c-text-2);
  margin: 10px 0;
  line-height: 1.5rem;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.link {
  display: inline-block;
  width: 24px;
  text-align: center;
  border: 1px var(--vp-c-divider-light) solid;
  border-right: none;
  font-weight: 400;
}

.link.active {
  background: var(--vp-c-text-1);
  color: var(--vp-c-text-inverse-1);
  border: 1px solid var(--vp-c-text-1) !important;
}

.link:first-child {
  border-bottom-left-radius: 2px;
  border-top-left-radius: 2px;
}

.link:last-child {
  border-bottom-right-radius: 2px;
  border-top-right-radius: 2px;
  border-right: 1px var(--vp-c-divider-light) solid;
}

@media screen and (max-width: 768px) {
  .post-list {
    padding: 14px 0 14px 0;
  }

  .post-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .post-title {
    font-size: 1.0625rem;
    font-weight: 400;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
    width: 17rem;
  }

  .describe {
    font-size: 0.9375rem;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    margin: 0.5rem 0 1rem;
  }
}
</style>
