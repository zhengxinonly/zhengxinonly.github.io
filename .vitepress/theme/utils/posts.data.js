// posts.data.js
import {createContentLoader} from 'vitepress';

const pages = createContentLoader('/(posts|environment)/*.md', {
    includeSrc: false, // include raw markdown source?
    render: false,     // include rendered full page HTML?
    excerpt: false,    // include excerpt?
    transform(rawData) {
        // map, sort, or filter the raw data as you wish.
        // the final result is what will be shipped to the client.
        return rawData.sort((a, b) => {
            return +new Date(b.frontmatter.date) - +new Date(a.frontmatter.date);
        });
    },
});

export default pages;
